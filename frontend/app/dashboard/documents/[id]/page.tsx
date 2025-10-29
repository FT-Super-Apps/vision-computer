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
    }, 5000) // Check every 5 seconds (resource-friendly)

    return () => clearInterval(interval)
  }, [document?.status, jobId])

  const fetchDocument = async () => {
    try {
      const response = await fetch(`/api/documents/${documentId}`)
      const data = await response.json()

      if (data.success) {
        setDocument(data.data)

        // Try to load jobId from localStorage
        const savedJobId = localStorage.getItem(`doc-job-${documentId}`)
        if (savedJobId) {
          setJobId(savedJobId)
        }
      } else {
        throw new Error('Dokumen tidak ditemukan')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
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
    if (!jobId) return

    try {
      const response = await fetch(
        `/api/documents/${documentId}/process-status?jobId=${jobId}`
      )
      const data = await response.json()

      if (data.success) {
        const { state, progress, result } = data.data

        setProcessingProgress(progress)

        // Refresh document to get updated status
        if (
          state === 'SUCCESS' ||
          state === 'COMPLETED' ||
          state === 'FAILURE' ||
          state === 'FAILED'
        ) {
          setTimeout(() => {
            fetchDocument()
            localStorage.removeItem(`doc-job-${documentId}`)
            setJobId(null)
          }, 500)
        }
      }
    } catch (error) {
      console.error('Error checking status:', error)
    }
  }

  const handleDownload = async (filename: string) => {
    try {
      const response = await fetch(
        `/api/files/download?filename=${encodeURIComponent(filename)}`
      )

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      // Create download link
      const a = window.document.createElement('a')
      a.href = url
      a.download = filename
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)

      toast({
        variant: 'success',
        title: 'Berhasil',
        description: 'File berhasil diunduh',
      })
    } catch (error) {
      console.error('Download error:', error)
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
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>Selesai</span>
          </div>
        )
      case 'PROCESSING':
      case 'ANALYZING':
        return (
          <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Diproses</span>
          </div>
        )
      case 'FAILED':
        return (
          <div className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            <span>Gagal</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
            <Clock className="h-5 w-5" />
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
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail dokumen...</p>
        </div>
      </div>
    )
  }

  if (!document) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 min-h-screen p-8">
        <div className="max-w-4xl">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/documents')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <Card className="shadow-lg border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <AlertCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Dokumen tidak ditemukan</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-4xl">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={() => router.push('/dashboard/documents')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dokumen
        </Button>

        {/* Header */}
        <Card className="mb-6 shadow-lg border-2">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start space-x-4 flex-1">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-gray-900 break-words">
                    {document.title}
                  </h1>
                  <p className="text-gray-600 mt-1 break-words">
                    {document.originalFilename}
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    {getStatusBadge(document.status)}
                    {document.pdfPath && (
                      <span className="text-xs bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-medium">
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
          <Card className="mb-6 shadow-2xl border-4 border-blue-400 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardContent className="pt-8 pb-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-xl">
                  <Zap className="h-10 w-10 text-white animate-pulse" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Sedang Diproses
                </h2>
                <p className="text-gray-600 text-lg">
                  Mohon tunggu, dokumen Anda sedang diproses secara otomatis
                </p>
              </div>

              {processingProgress ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-4">
                    <p className="text-xl font-semibold text-gray-800">
                      {processingProgress.message || 'Memproses dokumen...'}
                    </p>
                    <span className="text-4xl font-bold text-blue-600">
                      {processingProgress.percent || 0}%
                    </span>
                  </div>

                  <div className="w-full bg-gray-300 rounded-full h-8 shadow-inner">
                    <div
                      className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 h-8 rounded-full transition-all duration-500 ease-out flex items-center justify-end px-3 shadow-lg animate-gradient"
                      style={{
                        width: `${processingProgress.percent || 0}%`,
                      }}
                    >
                      {processingProgress.percent > 10 && (
                        <span className="text-white font-bold text-sm">
                          {processingProgress.percent}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Status</p>
                      <p className="text-lg font-bold text-blue-600">
                        {processingProgress.state || 'PROCESSING'}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Progress</p>
                      <p className="text-lg font-bold text-purple-600">
                        {processingProgress.current || 0}/{processingProgress.total || 13} Steps
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Estimasi</p>
                      <p className="text-lg font-bold text-green-600">
                        ~{Math.round((100 - (processingProgress.percent || 0)) / 10)} menit
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-100 border-l-4 border-blue-600 p-4 mt-6 rounded">
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0 animate-spin" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Halaman ini akan diperbarui otomatis</p>
                        <p className="text-xs text-blue-700 mt-1">
                          Anda tidak perlu me-refresh halaman. Progress akan ter-update setiap 5 detik.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <p className="text-gray-600">Menghubungkan ke server processing...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Document Info */}
        <Card className="mb-6 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dokumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Ukuran File</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanggal Upload</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(document.createdAt)}
                  </p>
                </div>
              </div>

              {document.analysis && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Bendera Ditemukan</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {document.analysis.flagCount}
                    </p>
                  </div>
                  {document.analysis.similarityScore !== undefined && (
                    <div>
                      <p className="text-sm text-gray-600">Skor Similaritas</p>
                      <p className="text-lg font-semibold text-gray-900">
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
        <Card className="mb-6 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-600" />
              File Dokumen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DOCX File */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <File className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">
                    {document.originalFilename}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                onClick={() => handleDownload(document.originalFilename)}
                className="bg-blue-600 hover:bg-blue-700 text-white ml-2"
              >
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>

            {/* PDF File */}
            {document.pdfPath && document.pdfFilename && (
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <File className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {document.pdfFilename}
                    </p>
                    <p className="text-sm text-gray-600">File Turnitin</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleDownload(document.pdfFilename!)}
                  className="bg-purple-600 hover:bg-purple-700 text-white ml-2"
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
          <Card className="shadow-lg border-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-600" />
                Riwayat Bypass
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {document.bypasses.map((bypass) => (
                  <div
                    key={bypass.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {bypass.strategy}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(bypass.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-right">
                      {bypass.successRate !== undefined && (
                        <div>
                          <p className="text-sm text-gray-600">Success Rate</p>
                          <p className="font-semibold text-gray-900">
                            {bypass.successRate.toFixed(1)}%
                          </p>
                        </div>
                      )}
                      {bypass.flagsRemoved !== undefined && (
                        <div>
                          <p className="text-sm text-gray-600">Bendera Dihapus</p>
                          <p className="font-semibold text-gray-900">
                            {bypass.flagsRemoved}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        {bypass.status === 'COMPLETED' ? (
                          <p className="font-semibold text-green-600">
                            Selesai
                          </p>
                        ) : (
                          <p className="font-semibold text-gray-900">
                            {bypass.status}
                          </p>
                        )}
                      </div>
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
