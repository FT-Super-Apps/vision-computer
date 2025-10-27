import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/packages
 *
 * PUBLIC API - No authentication required
 *
 * Get all active packages for display on landing page and subscription selection.
 * This endpoint is intentionally public to allow visitors to see pricing
 * before registration.
 *
 * @returns {Object} Response with success status and packages array
 * @returns {boolean} response.success - Indicates if request was successful
 * @returns {Array} response.data - Array of package objects with pricing and features
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

    // Return with CORS headers to ensure public access
    return NextResponse.json(
      {
        success: true,
        data: packages,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  } catch (error: any) {
    console.error('Error fetching packages:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch packages',
        message: error.message,
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
}
