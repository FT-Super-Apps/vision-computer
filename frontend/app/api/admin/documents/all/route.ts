import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }
    if (userId) {
      where.userId = userId
    }

    // Get all documents (admin can see all)
    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          analysis: {
            select: {
              flagCount: true,
              similarityScore: true,
              analyzedAt: true,
            },
          },
          bypasses: {
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              id: true,
              strategy: true,
              status: true,
              progress: true,
              outputFilename: true,
              outputPath: true,
              createdAt: true,
              completedAt: true,
              flagsRemoved: true,
              successRate: true,
              processingTime: true,
              errorMessage: true,
            },
          },
        },
        orderBy: {
          uploadedAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        documents,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error: any) {
    console.error('[ADMIN_DOCUMENTS_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to get documents', details: error.message },
      { status: 500 }
    )
  }
}
