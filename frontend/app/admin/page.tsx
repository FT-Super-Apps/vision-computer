'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Users,
  TrendingUp,
  Activity
} from 'lucide-react'

interface AdminStats {
  overview: {
    totalUsers: number
    totalDocuments: number
    totalBypasses: number
    activeUsers: number
    documentsToday: number
    bypassesCompleted: number
    bypassesFailed: number
    processingNow: number
    successRate: string
  }
  recentActivity: Array<{
    id: string
    action: string
    resource: string
    createdAt: string
    user: {
      name: string
      email: string
    } | null
    details: any
  }>
  topUsers: Array<{
    id: string
    name: string
    email: string
    _count: {
      documents: number
      bypasses: number
    }
  }>
}

interface Document {
  id: string
  title: string
  originalFilename: string
  status: string
  uploadedAt: string
  user: {
    id: string
    name: string
    email: string
    role: string
  }
  analysis?: {
    flagCount: number
    analyzedAt: string
  }
  bypasses: Array<{
    id: string
    strategy: string
    status: string
    progress: number
    createdAt: string
    completedAt?: string
    flagsRemoved?: number
    processingTime?: number
    errorMessage?: string
  }>
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'users'>('overview')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchStats()
      fetchDocuments()
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        fetchStats()
        fetchDocuments()
      }, 10000)
      return () => clearInterval(interval)
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/admin/documents/all?limit=10')
      const data = await response.json()
      if (data.success) {
        setDocuments(data.data.documents)
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
      case 'ANALYZING':
      case 'QUEUED':
        return 'bg-blue-100 text-blue-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat Dashboard Admin...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="p-8">
      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-white rounded-lg p-1 border inline-flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } px-4 py-2 rounded-md font-medium text-sm transition-all`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`${
              activeTab === 'documents'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } px-4 py-2 rounded-md font-medium text-sm transition-all`}
          >
            Dokumen
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } px-4 py-2 rounded-md font-medium text-sm transition-all`}
          >
            Pengguna
          </button>
        </div>
      </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Pengguna</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.totalUsers}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.overview.activeUsers} aktif 7 hari terakhir</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Dokumen</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.totalDocuments}</p>
                      <p className="text-xs text-gray-500 mt-1">{stats.overview.documentsToday} diupload hari ini</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sedang Diproses</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.processingNow}</p>
                      <p className="text-xs text-gray-500 mt-1">Pekerjaan aktif</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tingkat Keberhasilan</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stats.overview.successRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {stats.overview.bypassesCompleted} selesai / {stats.overview.bypassesFailed} gagal
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Top Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Event sistem terbaru</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{activity.action}</p>
                          <p className="text-sm text-gray-500">
                            {activity.user?.name || 'Sistem'}
                          </p>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Pengguna Teratas</CardTitle>
                  <CardDescription className="text-sm text-gray-500">Pengguna paling aktif</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium text-gray-900">{user._count.documents} dok</p>
                          <p className="text-xs text-gray-500">{user._count.bypasses} bypass</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Semua Dokumen Pengguna</CardTitle>
              <CardDescription className="text-sm text-gray-500">Status pemrosesan real-time untuk semua pengguna</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.originalFilename}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          User: {doc.user.name} ({doc.user.email})
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>

                    {/* Progress Bar for Active Jobs */}
                    {doc.bypasses[0] && ['PENDING', 'QUEUED', 'PROCESSING'].includes(doc.bypasses[0].status) && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-700 font-medium">Progres Pemrosesan</span>
                          <span className="font-medium text-gray-900">{doc.bypasses[0].progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${doc.bypasses[0].progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-600 mt-2">
                          Strategi: {doc.bypasses[0].strategy}
                        </p>
                      </div>
                    )}

                    {/* Completed Info */}
                    {doc.bypasses[0] && doc.bypasses[0].status === 'COMPLETED' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex gap-6 text-sm text-gray-700">
                          {doc.bypasses[0].flagsRemoved !== undefined && (
                            <span>Flag Dihapus: <span className="font-medium text-green-600">{doc.bypasses[0].flagsRemoved}</span></span>
                          )}
                          {doc.bypasses[0].processingTime && (
                            <span>Waktu Proses: <span className="font-medium text-blue-600">{doc.bypasses[0].processingTime}s</span></span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Info */}
                    {doc.bypasses[0] && doc.bypasses[0].status === 'FAILED' && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="text-sm text-red-700">
                            Error: {doc.bypasses[0].errorMessage || 'Error tidak diketahui'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Belum ada dokumen</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Manajemen Pengguna</CardTitle>
              <CardDescription className="text-sm text-gray-500">Lihat dan kelola pengguna sistem</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Fitur manajemen pengguna akan segera hadir...</p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  )
}
