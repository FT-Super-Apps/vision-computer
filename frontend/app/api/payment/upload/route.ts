import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AccountStatus } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

/**
 * POST /api/payment/upload
 * Upload payment proof
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    // Check if user has completed profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })

    if (!user?.profile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const packageId = formData.get('packageId') as string
    const paymentMethod = formData.get('paymentMethod') as string
    const accountName = formData.get('accountName') as string
    const accountNumber = formData.get('accountNumber') as string | null
    const amount = parseInt(formData.get('amount') as string)
    const transactionDate = formData.get('transactionDate') as string
    const notes = formData.get('notes') as string | null

    // Validate required fields
    if (!file || !packageId || !paymentMethod || !accountName || !amount || !transactionDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate package exists
    const pkg = await prisma.package.findUnique({
      where: { id: packageId },
    })

    if (!pkg) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Validate file type (only images)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'payment-proofs')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = path.extname(file.name)
    const filename = `payment_${userId}_${timestamp}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Create payment proof record
    const paymentProof = await prisma.paymentProof.create({
      data: {
        userId,
        packageId,
        paymentMethod,
        accountName,
        accountNumber,
        amount,
        proofImageUrl: `/uploads/payment-proofs/${filename}`,
        originalFilename: file.name,
        fileSize: file.size,
        transactionDate: new Date(transactionDate),
        notes,
        status: 'PENDING',
      },
    })

    // Create subscription record (pending)
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        packageId,
        paymentProofId: paymentProof.id,
        status: 'PENDING',
        isActive: false,
      },
    })

    // Update user account status to PENDING_VERIFICATION
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.PENDING_VERIFICATION,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PAYMENT_PROOF_UPLOADED',
        resource: 'payment_proof',
        resourceId: paymentProof.id,
        details: {
          packageCode: pkg.code,
          packageName: pkg.name,
          amount,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment proof uploaded successfully. Please wait for admin verification.',
      data: {
        paymentProof,
        subscription,
      },
      nextStep: 'VERIFICATION', // Indicate next step for frontend
    })
  } catch (error: any) {
    console.error('Error uploading payment proof:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload payment proof',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
