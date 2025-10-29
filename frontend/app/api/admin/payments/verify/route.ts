import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AccountStatus } from '@prisma/client'

/**
 * POST /api/admin/payments/verify
 * Verify or reject payment proof (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin authorization
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Tidak diizinkan. Akses admin diperlukan.' },
        { status: 403 }
      )
    }

    const adminId = session.user.id
    const body = await request.json()
    const { paymentProofId, action, rejectionReason, adminNotes } = body

    // Validate input
    if (!paymentProofId || !action) {
      return NextResponse.json(
        { error: 'ID bukti pembayaran dan aksi diperlukan' },
        { status: 400 }
      )
    }

    if (!['VERIFY', 'REJECT'].includes(action)) {
      return NextResponse.json(
        { error: 'Aksi tidak valid. Harus VERIFY atau REJECT' },
        { status: 400 }
      )
    }

    if (action === 'REJECT' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Alasan penolakan diperlukan saat menolak pembayaran' },
        { status: 400 }
      )
    }

    // Get payment proof with relations
    const paymentProof = await prisma.paymentProof.findUnique({
      where: { id: paymentProofId },
      include: {
        user: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!paymentProof) {
      return NextResponse.json(
        { error: 'Bukti pembayaran tidak ditemukan' },
        { status: 404 }
      )
    }

    if (paymentProof.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Bukti pembayaran sudah diproses' },
        { status: 400 }
      )
    }

    const now = new Date()

    if (action === 'VERIFY') {
      // Update payment proof status to VERIFIED
      await prisma.paymentProof.update({
        where: { id: paymentProofId },
        data: {
          status: 'VERIFIED',
          verifiedBy: adminId,
          verifiedAt: now,
          adminNotes,
        },
      })

      // Activate subscription
      const validityDays = paymentProof.subscription!.package.validityDays
      const startDate = now
      const endDate = new Date(now)
      endDate.setDate(endDate.getDate() + validityDays)

      await prisma.subscription.update({
        where: { id: paymentProof.subscription!.id },
        data: {
          status: 'ACTIVE',
          isActive: true,
          startDate,
          endDate,
        },
      })

      // Update user account status to ACTIVE
      await prisma.user.update({
        where: { id: paymentProof.userId },
        data: {
          accountStatus: AccountStatus.ACTIVE,
          isActive: true,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: paymentProof.userId,
          action: 'PAYMENT_VERIFIED',
          resource: 'payment_proof',
          resourceId: paymentProofId,
          details: {
            verifiedBy: adminId,
            packageCode: paymentProof.subscription!.package.code,
            packageName: paymentProof.subscription!.package.name,
            validUntil: endDate,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Pembayaran berhasil diverifikasi. Akun pengguna sekarang aktif.',
        data: {
          paymentProof: {
            id: paymentProof.id,
            status: 'VERIFIED',
            verifiedAt: now,
          },
          subscription: {
            status: 'ACTIVE',
            startDate,
            endDate,
          },
          user: {
            accountStatus: 'ACTIVE',
            isActive: true,
          },
        },
      })
    } else {
      // REJECT
      // Update payment proof status to REJECTED
      await prisma.paymentProof.update({
        where: { id: paymentProofId },
        data: {
          status: 'REJECTED',
          verifiedBy: adminId,
          verifiedAt: now,
          rejectionReason,
          adminNotes,
        },
      })

      // Cancel subscription
      await prisma.subscription.update({
        where: { id: paymentProof.subscription!.id },
        data: {
          status: 'CANCELLED',
          isActive: false,
        },
      })

      // Update user account status back to PENDING_PAYMENT
      await prisma.user.update({
        where: { id: paymentProof.userId },
        data: {
          accountStatus: AccountStatus.PENDING_PAYMENT,
          isActive: false,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId: paymentProof.userId,
          action: 'PAYMENT_REJECTED',
          resource: 'payment_proof',
          resourceId: paymentProofId,
          details: {
            rejectedBy: adminId,
            reason: rejectionReason,
            packageCode: paymentProof.subscription!.package.code,
          },
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Pembayaran ditolak. Pengguna perlu mengunggah ulang bukti pembayaran.',
        data: {
          paymentProof: {
            id: paymentProof.id,
            status: 'REJECTED',
            rejectionReason,
          },
          user: {
            accountStatus: 'PENDING_PAYMENT',
          },
        },
      })
    }
  } catch (error: any) {
    console.error('Error processing payment verification:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Gagal memproses verifikasi pembayaran',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
