'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  File,
  Download,
  Trash2,
  Eye,
  Plus,
  Search,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
} from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface Document {
  id: string
  title: string
  originalFilename: string
  fileSize: number
  status: string
  createdAt: string
  uploadPath: string
  pdfPath?: string
  analysis?: {
    flagCount: number
    similarityScore?: number
  }
  bypasses: Array<{
    id: string
    strategy: string
    status: string
  }>
}

export default function DocumentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')

  useEffect(() => {
    if (session?.user?.id) {
      fetchDocuments()
    }
  }, [session])

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents/user/${session?.user?.id}`)
      const data = await response.json()

      if (data.success) {
        setDocuments(data.data.documents || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal mengambil daftar dokumen',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) {
      return
    }

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Gagal menghapus dokumen')
      }

      setDocuments(documents.filter((d) => d.id !== documentId))

      toast({
        variant: 'success',
        title: 'Berhasil',
        description: 'Dokumen berhasil dihapus',
      })
    } catch (error) {
      console.error('Delete error:', error)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: 'Gagal menghapus dokumen',
      })
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            <CheckCircle className="h-4 w-4" />
            <span>Selesai</span>
          </div>
        )
      case 'PROCESSING':
      case 'ANALYZING':
        return (
          <div className="flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            <Clock className="h-4 w-4 animate-spin" />
            <span>Diproses</span>
          </div>
        )
      case 'FAILED':
        return (
          <div className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            <AlertCircle className="h-4 w-4" />
            <span>Gagal</span>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
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

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.originalFilename.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'ALL' || doc.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat dokumen...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 flex items-center">
              <FileText className="h-10 w-10 mr-3 text-blue-600" />
              Dokumen Saya
            </h1>
            <p className="text-gray-600 mt-1">Kelola dan kelola dokumen yang sudah diunggah</p>
          </div>
          <Link href="/dashboard/documents/upload">
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg h-12">
              <Plus className="h-5 w-5 mr-2" />
              Upload Dokumen Baru
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6 shadow-lg border-2">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari dokumen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">Semua Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="ANALYZING">Dianalisis</option>
                  <option value="PROCESSING">Diproses</option>
                  <option value="COMPLETED">Selesai</option>
                  <option value="FAILED">Gagal</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {filteredDocuments.length === 0 ? (
          <Card className="shadow-lg border-2">
            <CardContent className="pt-12 pb-12 text-center">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">
                {documents.length === 0
                  ? 'Belum ada dokumen yang diunggah'
                  : 'Tidak ada dokumen yang sesuai dengan pencarian'}
              </p>
              {documents.length === 0 && (
                <Link href="/dashboard/documents/upload">
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Dokumen Pertama
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id} className="shadow-lg border-2 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-6">
                    {/* Document Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                            <File className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-gray-900 truncate">
                              {doc.title}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                              {doc.originalFilename}
                            </p>
                            <div className="flex items-center space-x-3 mt-2">
                              {getStatusBadge(doc.status)}
                              {doc.pdfPath && (
                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                                  PDF Turnitin
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Document Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-xs text-gray-600">Ukuran File</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatFileSize(doc.fileSize)}
                          </p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg border">
                          <p className="text-xs text-gray-600">Tanggal Upload</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatDate(doc.createdAt)}
                          </p>
                        </div>
                        {doc.analysis && (
                          <>
                            <div className="p-3 bg-gray-50 rounded-lg border">
                              <p className="text-xs text-gray-600">Bendera Ditemukan</p>
                              <p className="text-sm font-medium text-gray-900">
                                {doc.analysis.flagCount}
                              </p>
                            </div>
                            {doc.analysis.similarityScore !== undefined && (
                              <div className="p-3 bg-gray-50 rounded-lg border">
                                <p className="text-xs text-gray-600">Similarity</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {doc.analysis.similarityScore.toFixed(1)}%
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/documents/${doc.id}`)}
                        className="flex items-center"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(doc.originalFilename)}
                        className="flex items-center"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
