import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/payments/pending
 * Get all pending payment proofs for verification (Admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Check admin authorization
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status !== 'ALL') {
      where.status = status
    }

    // Get payment proofs with user and package info
    const [paymentProofs, total] = await Promise.all([
      prisma.paymentProof.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              accountStatus: true,
              profile: {
                select: {
                  fullName: true,
                  phone: true,
                  institution: true,
                },
              },
            },
          },
          subscription: {
            include: {
              package: {
                select: {
                  code: true,
                  name: true,
                  price: true,
                  validityDays: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.paymentProof.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        paymentProofs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pending payments',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
