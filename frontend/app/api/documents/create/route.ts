import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      title,
      originalFilename,
      fileSize,
      fileType,
      uploadPath,
      userId,
      pageCount,
      wordCount,
      characterCount,
    } = body

    // Validate required fields
    if (!title || !originalFilename || !fileSize || !fileType || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create document record
    const document = await prisma.document.create({
      data: {
        title,
        originalFilename,
        fileSize,
        fileType,
        uploadPath,
        userId,
        pageCount,
        wordCount,
        characterCount,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      data: document,
    })
  } catch (error: any) {
    console.error('[DOCUMENT_CREATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to create document', details: error.message },
      { status: 500 }
    )
  }
}
