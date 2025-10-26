import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AccountStatus } from '@prisma/client'

/**
 * POST /api/profile/complete
 * Complete user profile after registration
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

    // Check if profile already exists
    const existingProfile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Profile already completed' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const {
      fullName,
      phone,
      address,
      city,
      province,
      postalCode,
      institution,
      major,
      studentId,
      purpose,
    } = body

    // Validate required fields
    if (!fullName || !phone) {
      return NextResponse.json(
        { error: 'Full name and phone are required' },
        { status: 400 }
      )
    }

    // Create profile
    const profile = await prisma.userProfile.create({
      data: {
        userId,
        fullName,
        phone,
        address,
        city,
        province,
        postalCode,
        institution,
        major,
        studentId,
        purpose,
      },
    })

    // Update user account status to PENDING_PAYMENT
    await prisma.user.update({
      where: { id: userId },
      data: {
        accountStatus: AccountStatus.PENDING_PAYMENT,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'PROFILE_COMPLETED',
        resource: 'user_profile',
        resourceId: profile.id,
        details: {
          fullName,
          institution,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
      data: profile,
      nextStep: 'PAYMENT', // Indicate next step for frontend
    })
  } catch (error: any) {
    console.error('Error completing profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to complete profile',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/profile/complete
 * Get current user's profile
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please login.' },
        { status: 401 }
      )
    }

    const userId = session.user.id

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'Profile not found',
          completed: false,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
      completed: true,
    })
  } catch (error: any) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch profile',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
