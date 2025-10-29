import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch all documents with job tracking info
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { status: 'PROCESSING' },
          { status: 'ANALYZING' },
          { status: 'COMPLETED' },
          { status: 'FAILED' },
        ],
        jobId: {
          not: null,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { status: 'asc' }, // Processing/Analyzing first
        { jobStartedAt: 'desc' },
      ],
      take: 100, // Limit to last 100 jobs
    })

    return NextResponse.json({
      success: true,
      data: documents,
    })
  } catch (error: any) {
    console.error('[ADMIN_JOBS_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs', details: error.message },
      { status: 500 }
    )
  }
}
