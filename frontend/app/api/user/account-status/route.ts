import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/user/account-status
 * Get current user's account status for redirect logic
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

    // Get user with profile and subscription info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        accountStatus: true,
        isActive: true,
        profile: {
          select: {
            id: true,
          },
        },
        subscriptions: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            status: true,
            endDate: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine next step based on account status
    let nextStep = ''
    let redirectUrl = ''

    if (user.role === 'ADMIN') {
      nextStep = 'DASHBOARD'
      redirectUrl = '/admin'
    } else {
      switch (user.accountStatus) {
        case 'PENDING_PROFILE':
          nextStep = 'COMPLETE_PROFILE'
          redirectUrl = '/subscription/complete-profile'
          break
        case 'PENDING_PAYMENT':
          nextStep = 'SELECT_PACKAGE'
          redirectUrl = '/subscription/select-package'
          break
        case 'PENDING_VERIFICATION':
          nextStep = 'AWAITING_VERIFICATION'
          redirectUrl = '/subscription/verification-status'
          break
        case 'ACTIVE':
          nextStep = 'DASHBOARD'
          redirectUrl = '/dashboard'
          break
        case 'SUSPENDED':
          nextStep = 'SUSPENDED'
          redirectUrl = '/subscription/suspended'
          break
        case 'EXPIRED':
          nextStep = 'RENEW_SUBSCRIPTION'
          redirectUrl = '/subscription/renew'
          break
        default:
          nextStep = 'DASHBOARD'
          redirectUrl = '/dashboard'
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        role: user.role,
        hasProfile: !!user.profile,
        nextStep,
        redirectUrl,
      },
    })
  } catch (error: any) {
    console.error('Error fetching account status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch account status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
