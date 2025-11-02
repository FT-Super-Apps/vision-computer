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
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div>
      <div className="max-w-[1400px] mx-auto">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Main Stats Card */}
          <div className="col-span-12 lg:col-span-7">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-200 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Aktivitas Dokumen</h2>
                  <p className="text-sm text-gray-500">Track your progress</p>
                </div>
                <select className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300">
                  <option>Minggu Ini</option>
                  <option>Bulan Ini</option>
                  <option>Tahun Ini</option>
                </select>
              </div>

              {/* Stats Display */}
              <div className="mb-8">
                <div className="text-sm text-gray-500 mb-2">{stats.total} Total Documents</div>
                <div className="text-5xl font-bold text-gray-900 mb-2">+{stats.completed}</div>
                <p className="text-gray-500 text-sm">Documents processed this week</p>
              </div>

              {/* Chart Area - Simple Bar Visualization */}
              <div className="relative h-48 flex items-end justify-around gap-3">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => {
                  const randomHeight = Math.random() * 80 + 40
                  const isToday = index === 3 // Wednesday as example
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center">
                      <div className="w-full relative flex items-end justify-center" style={{ height: '160px' }}>
                        <div
                          className={`w-full ${
                            isToday
                              ? 'bg-gray-800'
                              : 'bg-gray-300'
                          } rounded-lg transition-colors hover:bg-gray-600`}
                          style={{ height: `${randomHeight}%` }}
                        ></div>
                      </div>
                      <div className={`mt-3 w-9 h-9 ${isToday ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'} rounded-lg flex items-center justify-center font-medium`}>
                        <span className="text-xs">{day}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Recent Documents */}
          <div className="col-span-12 lg:col-span-5">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200 h-full">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Recent Documents</h3>
                  <p className="text-xs text-gray-500 mt-1">Your latest uploads</p>
                </div>
                <Link href="/dashboard/documents">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                    See All →
                  </button>
                </Link>
              </div>

              <div className="space-y-3">
                {documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">Belum ada dokumen</p>
                    <Button
                      onClick={handleUploadClick}
                      className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-10 px-6 text-sm"
                    >
                      Upload Dokumen
                    </Button>
                  </div>
                ) : (
                  documents.slice(0, 4).map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-11 h-11 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{doc.title}</h4>
                          <p className="text-xs text-gray-500 truncate">{formatFileSize(doc.fileSize)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {doc.status === 'COMPLETED' && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-xs font-medium">
                            Completed
                          </span>
                        )}
                        <button className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Row - Three Cards */}
          {/* Quick Actions Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Aksi Cepat</h3>
              <p className="text-sm text-gray-500 mb-6">Upload dan kelola dokumen Anda</p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <button className="flex-1 text-left">
                    <p className="font-medium text-gray-900 text-sm">Upload Dokumen</p>
                    <p className="text-xs text-gray-500">Tambah dokumen baru</p>
                  </button>
                  <button className="w-8 h-8 bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center justify-center transition-colors">
                    <span className="text-white text-lg">+</span>
                  </button>
                </div>
              </div>

              <Button
                onClick={handleUploadClick}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-lg h-11"
              >
                Upload Sekarang
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Stats Summary Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Ringkasan Status</h3>
              <p className="text-sm text-gray-500 mb-6">Statistik dokumen Anda</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dokumen Selesai</span>
                  <span className="text-2xl font-semibold text-gray-900">{stats.completed}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sedang Diproses</span>
                  <span className="text-2xl font-semibold text-gray-900">{stats.processing}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Dokumen</span>
                  <span className="text-2xl font-semibold text-gray-900">{stats.total}</span>
                </div>
              </div>

              <div className="mt-6 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-800 rounded-full transition-all"
                  style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Tingkat Keberhasilan
              </p>
            </div>
          </div>

          {/* Activity Progress Card */}
          <div className="col-span-12 lg:col-span-4">
            <div className="p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Progress Dokumen</h3>
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Hari ini
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Berhasil diproses</span>
                    <span className="font-semibold text-gray-900">{stats.completed}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={`completed-${i}`}
                        className={`flex-1 h-12 rounded-md ${
                          i < stats.completed ? 'bg-gray-400' : 'bg-gray-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Sedang diproses</span>
                    <span className="font-semibold text-gray-900">{stats.processing}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={`processing-${i}`}
                        className={`flex-1 h-12 rounded-md ${
                          i < stats.processing ? 'bg-gray-500' : 'bg-gray-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Pending/Gagal</span>
                    <span className="font-semibold text-gray-900">{stats.failed}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={`failed-${i}`}
                        className={`flex-1 h-12 rounded-md ${
                          i < stats.failed ? 'bg-gray-700' : 'bg-gray-100'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
