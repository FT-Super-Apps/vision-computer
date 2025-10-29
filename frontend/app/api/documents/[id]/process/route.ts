import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import fs from 'fs/promises'
import path from 'path'

const BACKEND_URL = process.env.PYTHON_API_URL || 'http://localhost:8000'

export async function POST(
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

    const documentId = params.id

    // Get document
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

    // Check if document has both DOCX and PDF
    if (!document.uploadPath || (!document.pdfPath && !document.uploadPath)) {
      return NextResponse.json(
        { error: 'Dokumen harus memiliki file DOCX dan PDF Turnitin untuk diproses' },
        { status: 400 }
      )
    }

    // Update document status to ANALYZING
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'ANALYZING',
        jobStartedAt: new Date(),
      },
    })

    // Prepare file paths
    const uploadsDir = path.join(process.cwd(), 'uploads', 'documents')
    const docxFileName = path.basename(document.uploadPath)
    const pdfFileName = document.pdfPath ? path.basename(document.pdfPath) : null

    const docxPath = path.join(uploadsDir, docxFileName)
    const pdfPath = pdfFileName ? path.join(uploadsDir, pdfFileName) : null

    // Check if files exist
    try {
      await fs.access(docxPath)
      if (pdfPath) {
        await fs.access(pdfPath)
      }
    } catch {
      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      })
      return NextResponse.json(
        { error: 'File dokumen tidak ditemukan di server' },
        { status: 400 }
      )
    }

    // Read files as binary
    const docxBuffer = await fs.readFile(docxPath)
    const pdfBuffer = pdfPath ? await fs.readFile(pdfPath) : null

    // Create FormData for backend
    const formData = new FormData()

    // Add files
    const docxBlob = new Blob([docxBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const pdfBlob = pdfBuffer
      ? new Blob([pdfBuffer], { type: 'application/pdf' })
      : null

    formData.append('original_doc', docxBlob, docxFileName)
    if (pdfBlob) {
      formData.append('turnitin_pdf', pdfBlob, pdfFileName!)
    }

    formData.append('original_filename', docxFileName)
    if (pdfFileName) {
      formData.append('turnitin_filename', pdfFileName)
    }

    // Call backend API
    const backendResponse = await fetch(`${BACKEND_URL}/jobs/process-document`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-API-Key': process.env.PYTHON_API_KEY || '',
      },
    })

    if (!backendResponse.ok) {
      const error = await backendResponse.text()
      console.error('[BACKEND_ERROR]', error)

      await prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED' },
      })

      return NextResponse.json(
        { error: 'Gagal mengirim dokumen ke backend', details: error },
        { status: 500 }
      )
    }

    const backendData = await backendResponse.json()
    const jobId = backendData.job_id || backendData.task_id

    // Save jobId to database for admin monitoring
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: 'PROCESSING',
        jobId: jobId,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        jobId: jobId,
        status: 'PROCESSING',
        statusUrl: backendData.status_url,
      },
    })
  } catch (error: any) {
    console.error('[DOCUMENT_PROCESS_ERROR]', error)

    // Try to update status to FAILED
    try {
      await prisma.document.update({
        where: { id: params.id },
        data: { status: 'FAILED' },
      })
    } catch {}

    return NextResponse.json(
      { error: 'Gagal memproses dokumen', details: error.message },
      { status: 500 }
    )
  }
}
