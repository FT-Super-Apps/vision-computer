'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FileText,
  User,
  LogOut,
  Menu,
  X,
  Home,
  Settings,
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      router.push('/admin')
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role === 'ADMIN') {
    return null
  }

  const menuItems = [
    { key: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: '/dashboard/documents', label: 'Dokumen', icon: FileText },
    { key: '/dashboard/profile', label: 'Profil', icon: User },
  ]

  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'Dashboard'
    if (pathname === '/dashboard/documents') return 'Dokumen Saya'
    if (pathname === '/dashboard/documents/upload') return 'Upload Dokumen'
    if (pathname.startsWith('/dashboard/documents/')) return 'Detail Dokumen'
    if (pathname === '/dashboard/profile' || pathname === '/profile') return 'Profil Saya'
    return 'User Panel'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-screen z-30`}>
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center px-4">
          {sidebarOpen ? (
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏠</span>
              </div>
              <span className="font-bold text-gray-900">User Panel</span>
            </div>
          ) : (
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-xl">🏠</span>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Tutup sidebar"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {/* Main Menu */}
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.key || (item.key === '/dashboard/documents' && pathname.startsWith('/dashboard/documents'))
              return (
                <button
                  key={item.key}
                  onClick={() => router.push(item.key)}
                  className={`${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  } w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
                </button>
              )
            })}
          </div>

          {/* Divider */}
          {sidebarOpen && (
            <div className="my-4">
              <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Lainnya</p>
            </div>
          )}
          {!sidebarOpen && <div className="my-3 border-t border-gray-200"></div>}

          {/* Additional Actions */}
          <div className="space-y-1">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium text-sm">Beranda</span>}
            </button>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen && (
            <div className="mb-3 px-4">
              <p className="text-sm font-medium text-gray-900 truncate">{session.user.name}</p>
              <p className="text-xs text-gray-500 truncate">{session.user.email}</p>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <div className="flex items-center space-x-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Buka sidebar"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-500">Kelola dokumen dan profil Anda</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
              <p className="text-xs text-gray-500 uppercase">User</p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
