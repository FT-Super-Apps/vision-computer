import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/payment/status
 * Get current user's payment status and subscription info
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

    // Get user with all related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        accountStatus: true,
        isActive: true,
        profile: true,
        paymentProofs: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            subscription: {
              include: {
                package: true,
              },
            },
          },
        },
        subscriptions: {
          where: {
            isActive: true,
          },
          include: {
            package: true,
            paymentProof: true,
          },
          orderBy: {
            endDate: 'desc',
          },
          take: 1,
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const latestPaymentProof = user.paymentProofs[0] || null
    const activeSubscription = user.subscriptions[0] || null

    return NextResponse.json({
      success: true,
      data: {
        accountStatus: user.accountStatus,
        isActive: user.isActive,
        hasProfile: !!user.profile,
        latestPaymentProof: latestPaymentProof
          ? {
              id: latestPaymentProof.id,
              status: latestPaymentProof.status,
              amount: latestPaymentProof.amount,
              paymentMethod: latestPaymentProof.paymentMethod,
              transactionDate: latestPaymentProof.transactionDate,
              proofImageUrl: latestPaymentProof.proofImageUrl,
              verifiedAt: latestPaymentProof.verifiedAt,
              rejectionReason: latestPaymentProof.rejectionReason,
              adminNotes: latestPaymentProof.adminNotes,
              package: latestPaymentProof.subscription?.package,
            }
          : null,
        activeSubscription: activeSubscription
          ? {
              id: activeSubscription.id,
              status: activeSubscription.status,
              startDate: activeSubscription.startDate,
              endDate: activeSubscription.endDate,
              documentsUsed: activeSubscription.documentsUsed,
              package: activeSubscription.package,
            }
          : null,
      },
    })
  } catch (error: any) {
    console.error('Error fetching payment status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch payment status',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
