import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/packages
 *
 * Admin endpoint to get all packages including inactive ones
 * with subscription counts
 */
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const packages = await prisma.package.findMany({
      orderBy: {
        order: 'asc',
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        packages,
      },
    })
  } catch (error: any) {
    console.error('[ADMIN_PACKAGES_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch packages', details: error.message },
      { status: 500 }
    )
  }
}
