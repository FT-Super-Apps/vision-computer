'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowLeft,
  Download,
  File,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  Zap,
} from 'lucide-react'

interface Document {
  id: string
  title: string
  originalFilename: string
  fileSize: number
  status: string
  createdAt: string
  uploadPath: string
  pdfPath?: string
  pdfFilename?: string
  analysis?: {
    flagCount: number
    similarityScore?: number
  }
  bypasses: Array<{
    id: string
    strategy: string
    status: string
    outputFilename: string
    successRate?: number
    flagsRemoved?: number
    createdAt: string
  }>
}

export default function DocumentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobId, setJobId] = useState<string | null>(null)
  const [processingProgress, setProcessingProgress] = useState<any>(null)

  const documentId = params.id as string

  useEffect(() => {
    if (documentId) {
      fetchDocument()
    }
  }, [documentId])

  // Auto-refresh for processing documents
  useEffect(() => {
    if (!document || document.status !== 'PROCESSING' || !jobId) {
      return
    }

    const interval = setInterval(() => {
      checkProcessingStatus()
    }, 1000) // Check every 1 second for faster updates

    return () => clearInterval(interval)
  }, [document?.status, jobId])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      const data = await response.json()

      if (data.success) {
        setDocument(data.data)
        console.log('[Document] Status:', data.data.status)

        // Try to load jobId from localStorage or database
        const savedJobId = localStorage.getItem(`doc-job-${documentId}`)
        const dbJobId = data.data.jobId

        const activeJobId = dbJobId || savedJobId

        if (activeJobId) {
          console.log('[Document] Found jobId:', activeJobId, 'source:', dbJobId ? 'database' : 'localStorage')
          setJobId(activeJobId)
        } else {
          console.log('[Document] No jobId found')
        }
      } else {
        throw new Error('Dokumen tidak ditemukan')
      }
    } catch (error) {
      console.error('[Document] Error fetching document:', error)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal mengambil detail dokumen',
      })
      router.push('/dashboard/documents')
    } finally {
      setLoading(false)
    }
  }

  const checkProcessingStatus = async () => {
    if (!jobId) {
      console.warn('[Progress] No jobId available')
      return
    }

    try {
      console.log('[Progress] Checking status for jobId:', jobId)

      const response = await fetch(
        `/api/documents/${documentId}/process-status?jobId=${jobId}`
      )
      const data = await response.json()

      console.log('[Progress] Response:', data)

      if (data.success) {
        const { state, progress, result } = data.data

        // Update progress with state info
        const progressData = {
          ...progress,
          state: state,
          percent: progress?.percent || 0,
          current: progress?.current || 0,
          total: progress?.total || 13,
          message: progress?.message || 'Memproses dokumen...',
        }

        console.log('[Progress] Setting progress:', progressData)
        setProcessingProgress(progressData)

        // Refresh document to get updated status
        if (
          state === 'SUCCESS' ||
          state === 'COMPLETED' ||
          state === 'FAILURE' ||
          state === 'FAILED'
        ) {
          console.log('[Progress] Process complete:', state)
          setTimeout(() => {
            fetchDocument()
            localStorage.removeItem(`doc-job-${documentId}`)
            setJobId(null)
          }, 500)
        }
      } else {
        console.error('[Progress] Request failed:', data)
      }
    } catch (error) {
      console.error('[Progress] Error checking status:', error)
    }
  }

  const handleDownload = async (filename: string, isBypassResult: boolean = false) => {
    try {
      let response

      if (isBypassResult) {
        // Download dari Python backend untuk hasil bypass
        const pythonApiUrl = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:8000'
        console.log('[Download] Bypass result from:', `${pythonApiUrl}/bypass/download/${filename}`)
        response = await fetch(
          `${pythonApiUrl}/bypass/download/${encodeURIComponent(filename)}`
        )
      } else {
        // Download dari NextJS API untuk file original
        console.log('[Download] Original file from:', `/api/files/download?filename=${filename}`)
        response = await fetch(
          `/api/files/download?filename=${encodeURIComponent(filename)}`
        )
      }

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        variant: 'success',
        title: 'Berhasil',
        description: 'File berhasil diunduh',
      })
    } catch (error) {
      console.error('[Download] Error:', error)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal mengunduh file',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200">
            <CheckCircle className="h-4 w-4" />
            <span>Selesai</span>
          </div>
        )
      case 'PROCESSING':
      case 'ANALYZING':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
            <Clock className="h-4 w-4" />
            <span>Diproses</span>
          </div>
        )
      case 'FAILED':
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-200">
            <AlertCircle className="h-4 w-4" />
            <span>Gagal</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg text-xs font-medium border border-gray-200">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </div>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail dokumen...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-4xl">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/documents')}
            className="mb-6 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Card className="shadow-sm border border-gray-200 rounded-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Dokumen tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/documents')}
          className="mb-6 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dokumen
        </Button>

        {/* Header */}
        <Card className="mb-6 shadow-sm border border-gray-200 rounded-xl">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-[#D1F8EF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="h-8 w-8 text-[#3674B5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-semibold text-gray-900 break-words">
                    {document.title}
                  </h1>
                  <p className="text-gray-500 mt-1 break-words text-sm">
                    {document.originalFilename}
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    {getStatusBadge(document.status)}
                    {document.pdfPath && (
                      <span className="text-xs bg-[#A1E3F9] text-[#3674B5] px-3 py-1 rounded-lg font-medium border border-[#578FCA]">
                        PDF Turnitin Tersedia
                      </span>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Monitoring Card - Large & Clear */}
        {(document.status === 'PROCESSING' || document.status === 'ANALYZING') && (
          <Card className="mb-6 shadow-sm border-2 border-gray-300 bg-white rounded-xl">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-gray-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                  Sedang Diproses
                </h2>
                <p className="text-gray-600">
                  Mohon tunggu, dokumen Anda sedang diproses secara otomatis
                </p>
              </div>

              {processingProgress ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <p className="text-lg font-medium text-gray-800">
                      {processingProgress.message || 'Memproses dokumen...'}
                    </p>
                    <span className="text-3xl font-semibold text-gray-900">
                      {processingProgress.percent || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-[#A1E3F9] rounded-full h-6">
                    <div
                      className="bg-[#3674B5] h-6 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-3"
                      style={{
                        width: `${processingProgress.percent || 0}%`,
                      }}
                    >
                      {processingProgress.percent > 10 && (
                        <span className="text-white font-medium text-xs">
                          {processingProgress.percent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Status</p>
                      <p className="text-base font-semibold text-gray-900">
                        {processingProgress.state || 'PROCESSING'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Progress</p>
                      <p className="text-base font-semibold text-gray-900">
                        {processingProgress.current || 0}/{processingProgress.total || 13} Steps
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 uppercase font-medium">Estimasi</p>
                      <p className="text-base font-semibold text-gray-900">
                        ~{Math.round((100 - (processingProgress.percent || 0)) / 10)} menit
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-100 border-l-4 border-gray-600 p-4 mt-6 rounded-md">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-600 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Halaman ini akan diperbarui otomatis</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Anda tidak perlu me-refresh halaman. Progress akan ter-update setiap 2 detik.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-gray-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-gray-600">Menghubungkan ke server processing...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Info */}
        <Card className="mb-6 shadow-sm border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ukuran File</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Upload</p>
                  <p className="text-base font-medium text-gray-900">
                    {formatDate(document.createdAt)}
                  </p>
                </div>
              </div>

              {document.analysis && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Bendera Ditemukan</p>
                    <p className="text-base font-medium text-gray-900">
                      {document.analysis.flagCount}
                    </p>
                  </div>
                  {document.analysis.similarityScore !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Skor Similaritas</p>
                      <p className="text-base font-medium text-gray-900">
                        {document.analysis.similarityScore.toFixed(1)}%
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="mb-6 shadow-sm border border-gray-200 rounded-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center">
              <FileText className="h-5 w-5 mr-2 text-gray-600" />
              File Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* DOCX File */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-[#D1F8EF] rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="h-5 w-5 text-[#3674B5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {document.originalFilename}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleDownload(document.originalFilename)}
                className="bg-[#3674B5] hover:bg-[#578FCA] text-white ml-2 rounded-lg"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            {/* PDF File */}
            {document.pdfPath && document.pdfFilename && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-[#D1F8EF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <File className="h-5 w-5 text-[#3674B5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {document.pdfFilename}
                    </p>
                    <p className="text-sm text-gray-500">File Turnitin</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(document.pdfFilename!)}
                  className="bg-[#3674B5] hover:bg-[#578FCA] text-white ml-2 rounded-lg"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bypass History */}
        {document.bypasses && document.bypasses.length > 0 && (
          <Card className="shadow-sm border border-gray-200 rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center">
                <Zap className="h-5 w-5 mr-2 text-gray-600" />
                Riwayat Bypass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {document.bypasses.map((bypass) => (
                  <div
                    key={bypass.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {bypass.strategy}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(bypass.createdAt)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 font-mono">
                        {bypass.outputFilename}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {bypass.successRate !== undefined && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Success Rate</p>
                          <p className="font-medium text-gray-900">
                            {bypass.successRate.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {bypass.flagsRemoved !== undefined && (
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Bendera Dihapus</p>
                          <p className="font-medium text-gray-900">
                            {bypass.flagsRemoved}
                          </p>
                        </div>
                      )}
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Status</p>
                        {bypass.status === 'COMPLETED' ? (
                          <p className="font-medium text-green-700">
                            Selesai
                          </p>
                        ) : (
                          <p className="font-medium text-gray-900">
                            {bypass.status}
                          </p>
                        )}
                      </div>
                      {bypass.status === 'COMPLETED' && bypass.outputFilename && (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(bypass.outputFilename, true)}
                          className="bg-[#3674B5] hover:bg-[#578FCA] text-white rounded-lg"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
