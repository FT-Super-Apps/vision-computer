'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">System-wide monitoring and management</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => router.push('/dashboard')} variant="outline">
              User View
            </Button>
            <Button onClick={() => router.push('/auth/logout')} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['overview', 'documents', 'users'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Users</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalUsers}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">{stats.overview.activeUsers} active last 7 days</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Documents</CardDescription>
                  <CardTitle className="text-3xl">{stats.overview.totalDocuments}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">{stats.overview.documentsToday} uploaded today</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Processing Now</CardDescription>
                  <CardTitle className="text-3xl text-blue-600">
                    {stats.overview.processingNow}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">Active jobs</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Success Rate</CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    {stats.overview.successRate}%
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-500">
                    {stats.overview.bypassesCompleted} completed / {stats.overview.bypassesFailed} failed
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity & Top Users */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system events</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 text-sm">
                        <div className="flex-1">
                          <p className="font-medium">{activity.action}</p>
                          <p className="text-gray-600">
                            {activity.user?.name || 'System'}
                          </p>
                        </div>
                        <p className="text-gray-500 text-xs">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Users */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Users</CardTitle>
                  <CardDescription>Most active users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats.topUsers.map((user, index) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">{user._count.documents} docs</p>
                          <p className="text-gray-500">{user._count.bypasses} bypasses</p>
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
          <Card>
            <CardHeader>
              <CardTitle>All User Documents</CardTitle>
              <CardDescription>Real-time processing status for all users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold">{doc.title}</h3>
                        <p className="text-sm text-gray-600">{doc.originalFilename}</p>
                        <p className="text-sm text-blue-600 mt-1">
                          User: {doc.user.name} ({doc.user.email})
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>

                    {/* Progress Bar for Active Jobs */}
                    {doc.bypasses[0] && ['PENDING', 'QUEUED', 'PROCESSING'].includes(doc.bypasses[0].status) && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Processing Progress</span>
                          <span className="font-medium">{doc.bypasses[0].progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${doc.bypasses[0].progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Strategy: {doc.bypasses[0].strategy}
                        </p>
                      </div>
                    )}

                    {/* Completed Info */}
                    {doc.bypasses[0] && doc.bypasses[0].status === 'COMPLETED' && (
                      <div className="mt-3 pt-3 border-t text-sm">
                        <div className="flex gap-6">
                          {doc.bypasses[0].flagsRemoved !== undefined && (
                            <span>Flags Removed: {doc.bypasses[0].flagsRemoved}</span>
                          )}
                          {doc.bypasses[0].processingTime && (
                            <span>Processing Time: {doc.bypasses[0].processingTime}s</span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Error Info */}
                    {doc.bypasses[0] && doc.bypasses[0].status === 'FAILED' && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-red-600">
                          Error: {doc.bypasses[0].errorMessage || 'Unknown error'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No documents yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>View and manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">User management features coming soon...</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
