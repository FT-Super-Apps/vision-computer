import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`

    // Get basic stats
    const userCount = await prisma.user.count()
    const documentCount = await prisma.document.count()

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        users: userCount,
        documents: documentCount,
      },
      services: {
        nextjs: 'running',
        prisma: 'connected',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
        database: {
          connected: false,
        },
      },
      { status: 503 }
    )
  }
}
