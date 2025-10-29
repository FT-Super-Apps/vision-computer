import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const BACKEND_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Tidak diizinkan' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID diperlukan' },
        { status: 400 }
      )
    }

    const documentId = params.id

    // Get document to verify ownership
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Dokumen tidak ditemukan' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (document.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke dokumen ini' },
        { status: 403 }
      )
    }

    // Check status from backend
    const statusResponse = await fetch(
      `${BACKEND_URL}/jobs/${jobId}/status`,
      {
        headers: {
          'X-API-Key': process.env.PYTHON_API_KEY || '',
        },
      }
    )

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: 'Gagal mengambil status dari backend' },
        { status: 500 }
      )
    }

    const statusData = await statusResponse.json()

    // If task is completed, update document status
    if (statusData.state === 'SUCCESS' || statusData.state === 'COMPLETED') {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'COMPLETED',
          jobCompletedAt: new Date(),
        },
      })

      // Save bypass result if available
      if (statusData.result && statusData.result.output_file) {
        await prisma.bypassHistory.create({
          data: {
            documentId,
            userId: document.userId,
            strategy: 'unified_bypass',
            status: 'COMPLETED',
            outputPath: statusData.result.output_file,
            outputFilename: statusData.result.output_file.split('/').pop() || '',
            outputFileSize: statusData.result.file_size || 0,
            flagsRemoved: statusData.result.total_replacements || 0,
            successRate: statusData.result.match_percentage || 0,
            processingTime: statusData.result.processing_time || 0,
            pythonApiResponse: statusData.result,
          },
        })
      }
    } else if (statusData.state === 'FAILURE' || statusData.state === 'FAILED') {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          status: 'FAILED',
          jobCompletedAt: new Date(),
        },
      })
    } else if (statusData.state === 'PROGRESS') {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'PROCESSING' },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        state: statusData.state,
        progress: statusData.progress || {},
        result: statusData.result || null,
        error: statusData.error || null,
      },
    })
  } catch (error: any) {
    console.error('[PROCESS_STATUS_ERROR]', error)
    return NextResponse.json(
      { error: 'Gagal mengambil status proses', details: error.message },
      { status: 500 }
    )
  }
}
