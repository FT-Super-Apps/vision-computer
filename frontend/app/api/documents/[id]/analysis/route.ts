import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const documentId = params.id

    const {
      flagCount,
      flagTypes,
      ocrText,
      metadata,
      similarityScore,
      plagiarismReport,
    } = body

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

    // Create or update analysis
    const analysis = await prisma.documentAnalysis.upsert({
      where: { documentId },
      create: {
        documentId,
        flagCount: flagCount || 0,
        flagTypes: flagTypes || [],
        ocrText,
        metadata: metadata || {},
        similarityScore,
        plagiarismReport,
      },
      update: {
        flagCount: flagCount || 0,
        flagTypes: flagTypes || [],
        ocrText,
        metadata: metadata || {},
        similarityScore,
        plagiarismReport,
      },
    })

    // Update document status to ANALYZED
    await prisma.document.update({
      where: { id: documentId },
      data: { status: 'ANALYZED' },
    })

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error: any) {
    console.error('[ANALYSIS_SAVE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to save analysis', details: error.message },
      { status: 500 }
    )
  }
}
