import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const documentId = params.id
    const { status } = body

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status enum
    const validStatuses = ['PENDING', 'ANALYZING', 'ANALYZED', 'PROCESSING', 'COMPLETED', 'FAILED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Update document status
    const document = await prisma.document.update({
      where: { id: documentId },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error: any) {
    console.error('[DOCUMENT_STATUS_UPDATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to update document status', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const documentId = params.id

    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        analysis: true,
        bypasses: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error: any) {
    console.error('[DOCUMENT_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to get document', details: error.message },
      { status: 500 }
    )
  }
}
