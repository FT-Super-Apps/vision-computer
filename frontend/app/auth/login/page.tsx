'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('') // username or email
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        identifier, // Send as identifier (can be username or email)
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Username/email atau password salah')
      } else {
        // Fetch user account status to determine redirect
        const statusResponse = await fetch('/api/user/account-status')
        const statusData = await statusResponse.json()

        if (statusData.success) {
          // Redirect based on account status
          router.push(statusData.data.redirectUrl)
          router.refresh()
        } else {
          // Fallback to dashboard
          router.push('/dashboard')
          router.refresh()
        }
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
      <div className="flex w-full max-w-7xl h-[90vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        {/* Left Side - Visual/Branding */}
        <div className="hidden lg:flex lg:w-[30%] bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-8 text-white">
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center mb-4 shadow-2xl mx-auto">
              <span className="text-4xl">🏠</span>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-center">Rumah Plagiasi</h1>
            <p className="text-blue-100 text-sm text-center">
              Platform terpercaya untuk membantu Anda melewati sistem deteksi plagiarism dengan aman dan mudah.
            </p>
          </div>

          {/* Stats */}
          <div className="space-y-3 mt-8 w-full">
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">1000+</div>
              <div className="text-blue-200 text-xs">Dokumen Diproses</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">98%</div>
              <div className="text-blue-200 text-xs">Sukses Rate</div>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="text-2xl font-bold mb-1">24/7</div>
              <div className="text-blue-200 text-xs">Support</div>
            </div>
          </div>
        </div>
      </div>

        {/* Right Side - Form */}
        <div className="w-full lg:w-[70%] flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🏠</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Rumah Plagiasi</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Selamat Datang Kembali</h2>
            <p className="text-gray-600">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-gray-700 font-medium">Username atau Email</Label>
              <Input
                id="identifier"
                type="text"
                placeholder="username atau nama@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={isLoading}
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12 text-base pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10 cursor-pointer"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </div>
              ) : (
                'Masuk'
              )}
            </Button>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Belum punya akun?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  Daftar Sekarang
                </Link>
              </p>
              <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition block">
                ← Kembali ke Beranda
              </Link>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  )
}
