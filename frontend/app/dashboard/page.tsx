'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

interface Document {
  id: string
  title: string
  originalFilename: string
  status: string
  uploadedAt: string
  fileSize: number
  analysis?: {
    flagCount: number
    similarityScore?: number
  }
  bypasses: Array<{
    id: string
    outputFilename: string
    outputPath: string
    flagsRemoved?: number
    successRate?: number
    createdAt: string
  }>
}

interface DocumentStats {
  total: number
  completed: number
  processing: number
  failed: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<DocumentStats>({
    total: 0,
    completed: 0,
    processing: 0,
    failed: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments()
    }
  }, [session])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(
        `/api/documents/user/${session?.user?.id}?limit=5`
      )
      const data = await response.json()

      if (data.success) {
        setDocuments(data.data.documents)

        // Calculate stats
        const allDocs = data.data.documents
        setStats({
          total: allDocs.length,
          completed: allDocs.filter((d: Document) => d.status === 'COMPLETED').length,
          processing: allDocs.filter((d: Document) =>
            ['PENDING', 'ANALYZING', 'PROCESSING'].includes(d.status)
          ).length,
          failed: allDocs.filter((d: Document) => d.status === 'FAILED').length,
        })
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setIsLoading(false)
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

  const handleUploadClick = () => {
    router.push('/dashboard/documents/upload')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50'
      case 'PROCESSING':
      case 'ANALYZING':
        return 'text-blue-600 bg-blue-50'
      case 'FAILED':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg border-2 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-gray-600 font-semibold">Total Dokumen</CardDescription>
              <CardTitle className="text-3xl font-bold text-gray-900">{stats.total}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-lg border-2 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-green-700 font-semibold">Selesai</CardDescription>
              <CardTitle className="text-3xl font-bold text-green-600">
                {stats.completed}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-lg border-2 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-blue-700 font-semibold">Diproses</CardDescription>
              <CardTitle className="text-3xl font-bold text-blue-600">
                {stats.processing}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-lg border-2 bg-gradient-to-br from-red-50 to-rose-50">
            <CardHeader className="pb-3">
              <CardDescription className="text-red-700 font-semibold">Gagal</CardDescription>
              <CardTitle className="text-3xl font-bold text-red-600">
                {stats.failed}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Documents */}
        <Card className="shadow-xl border-2">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">Dokumen Terbaru</CardTitle>
            <CardDescription className="text-gray-600">Riwayat pemrosesan dokumen Anda</CardDescription>
          </CardHeader>
          <CardContent>
            {documents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Belum ada dokumen</p>
                <Button
                  onClick={handleUploadClick}
                  className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Upload Dokumen
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="border-2 rounded-lg p-4 hover:shadow-lg transition-all bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.originalFilename}</p>
                        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                          <span>{formatFileSize(doc.fileSize)}</span>
                          <span>•</span>
                          <span>{formatDate(doc.uploadedAt)}</span>
                          {doc.analysis && (
                            <>
                              <span>•</span>
                              <span>{doc.analysis.flagCount} flag terdeteksi</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            doc.status
                          )}`}
                        >
                          {doc.status}
                        </span>
                        {doc.bypasses[0] && (
                          <Button
                            onClick={() =>
                              handleDownload(doc.bypasses[0].outputFilename)
                            }
                            size="sm"
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg transition-all"
                          >
                            Unduh
                          </Button>
                        )}
                      </div>
                    </div>
                    {doc.bypasses[0] && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                        <div className="flex gap-6">
                          {doc.bypasses[0].flagsRemoved !== undefined && (
                            <span>Flag Dihapus: {doc.bypasses[0].flagsRemoved}</span>
                          )}
                          {doc.bypasses[0].successRate !== undefined && (
                            <span>Tingkat Keberhasilan: {doc.bypasses[0].successRate.toFixed(1)}%</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {documents.length > 0 && (
              <div className="mt-6 text-center">
                <Link href="/dashboard/documents">
                  <Button variant="outline" className="h-10">Lihat Semua Dokumen</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
