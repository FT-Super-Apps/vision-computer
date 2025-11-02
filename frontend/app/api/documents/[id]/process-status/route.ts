import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const BACKEND_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

// Simple in-memory cache for document data (5 second TTL)
const documentCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5000 // 5 seconds

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

    // Try to get document from cache first
    const cachedDoc = documentCache.get(documentId)
    const now = Date.now()

    let document
    if (cachedDoc && (now - cachedDoc.timestamp) < CACHE_TTL) {
      // Use cached document
      document = cachedDoc.data
    } else {
      // Get document from database
      document = await prisma.document.findUnique({
        where: { id: documentId },
      })

      if (!document) {
        return NextResponse.json(
          { error: 'Dokumen tidak ditemukan' },
          { status: 404 }
        )
      }

      // Cache the document
      documentCache.set(documentId, { data: document, timestamp: now })
    }

    // Verify ownership
    if (document.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Anda tidak memiliki akses ke dokumen ini' },
        { status: 403 }
      )
    }

    // Check status from backend
    const apiKey = process.env.PYTHON_API_KEY || ''

    // Debug: Log API key status (remove in production)
    if (!apiKey) {
      console.error('[API_KEY_ERROR] PYTHON_API_KEY is not set in environment variables')
    }

    const statusResponse = await fetch(
      `${BACKEND_URL}/jobs/${jobId}/status`,
      {
        headers: {
          'X-API-Key': apiKey,
        },
      }
    )

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text()
      console.error('[BACKEND_ERROR]', {
        status: statusResponse.status,
        statusText: statusResponse.statusText,
        error: errorText,
        url: `${BACKEND_URL}/jobs/${jobId}/status`,
        hasApiKey: !!apiKey
      })

      return NextResponse.json(
        {
          error: 'Gagal mengambil status dari backend',
          details: errorText,
          hint: !apiKey ? 'API key not configured. Check PYTHON_API_KEY in .env' : undefined
        },
        { status: 500 }
      )
    }

    const statusData = await statusResponse.json()

    // Only update database if status actually changed
    const needsUpdate =
      (statusData.state === 'SUCCESS' || statusData.state === 'COMPLETED') && document.status !== 'COMPLETED' ||
      (statusData.state === 'FAILURE' || statusData.state === 'FAILED') && document.status !== 'FAILED' ||
      (statusData.state === 'PROGRESS' && document.status !== 'PROCESSING')

    // Update database in background (don't wait for it)
    if (needsUpdate) {
      // Invalidate cache when status changes
      documentCache.delete(documentId)

      // Fire and forget - update database without blocking response
      if (statusData.state === 'SUCCESS' || statusData.state === 'COMPLETED') {
        prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'COMPLETED',
            jobCompletedAt: new Date(),
          },
        }).then(() => {
          // Save bypass result if available
          if (statusData.result && statusData.result.output_file) {
            return prisma.bypassHistory.create({
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
        }).catch(err => console.error('[DB_UPDATE_ERROR]', err))
      } else if (statusData.state === 'FAILURE' || statusData.state === 'FAILED') {
        prisma.document.update({
          where: { id: documentId },
          data: {
            status: 'FAILED',
            jobCompletedAt: new Date(),
          },
        }).catch(err => console.error('[DB_UPDATE_ERROR]', err))
      } else if (statusData.state === 'PROGRESS') {
        prisma.document.update({
          where: { id: documentId },
          data: { status: 'PROCESSING' },
        }).catch(err => console.error('[DB_UPDATE_ERROR]', err))
      }
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
