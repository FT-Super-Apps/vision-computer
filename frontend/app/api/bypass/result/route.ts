import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      documentId,
      userId,
      strategy,
      status,
      outputPath,
      outputFilename,
      outputFileSize,
      flagsRemoved,
      processingTime,
      successRate,
      errorMessage,
      pythonApiResponse,
      configuration,
    } = body

    // Validate required fields
    if (!documentId || !userId || !strategy) {
      return NextResponse.json(
        { error: 'Missing required fields: documentId, userId, or strategy' },
        { status: 400 }
      )
    }

    // Check if document exists
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Create bypass history record
    const bypassHistory = await prisma.bypassHistory.create({
      data: {
        documentId,
        userId,
        strategy,
        status: status || 'COMPLETED',
        progress: status === 'COMPLETED' ? 100 : 0,
        outputPath,
        outputFilename,
        outputFileSize,
        flagsRemoved,
        processingTime,
        successRate,
        errorMessage,
        pythonApiResponse: pythonApiResponse || {},
        configuration: configuration || {},
        completedAt: status === 'COMPLETED' ? new Date() : null,
      },
    })

    // Update document status
    if (status === 'COMPLETED') {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'COMPLETED' },
      })
    } else if (status === 'FAILED') {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      })
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId,
        action: 'BYPASS_COMPLETED',
        resource: 'document',
        resourceId: documentId,
        details: {
          strategy,
          status,
          outputFilename,
          processingTime,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: bypassHistory,
    })
  } catch (error: any) {
    console.error('[BYPASS_RESULT_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to save bypass result', details: error.message },
      { status: 500 }
    )
  }
}
