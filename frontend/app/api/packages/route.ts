import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/packages
 * Get all active packages
 */
export async function GET(request: NextRequest) {
  try {
    const packages = await prisma.package.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        price: true,
        currency: true,
        features: true,
        maxDocuments: true,
        maxFileSize: true,
        validityDays: true,
        order: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: packages,
    })
  } catch (error: any) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packages',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
