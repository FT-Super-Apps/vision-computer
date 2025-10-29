'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { User, Mail, Phone, Building, Save } from 'lucide-react'

export default function ProfilePage() {
  const { data: session } = useSession()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [formData, setFormData] = useState({
    fullName: session?.user?.name || '',
    email: session?.user?.email || '',
    phone: '',
    institution: '',
  })

  // Load user profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch('/api/profile/update', {
          method: 'GET',
        })

        const data = await response.json()

        if (data.success && data.data) {
          setFormData((prev) => ({
            ...prev,
            fullName: data.data.fullName || prev.fullName,
            phone: data.data.phone || '',
            institution: data.data.institution || '',
          }))
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      } finally {
        setIsLoadingProfile(false)
      }
    }

    loadProfile()
  }, [session?.user?.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      toast({
        variant: 'warning',
        title: 'Peringatan',
        description: 'Nama lengkap harus diisi',
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          phone: formData.phone,
          institution: formData.institution,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          variant: 'success',
          title: 'Berhasil',
          description: 'Profil berhasil diperbarui',
        })
      } else {
        throw new Error(data.error || 'Gagal memperbarui profil')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast({
        variant: 'destructive',
        title: 'Gagal',
        description: error instanceof Error ? error.message : 'Gagal memperbarui profil',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6 shadow-lg border-2">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-4xl font-bold text-white">
                  {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {session?.user?.name || 'User'}
                </h1>
                <p className="text-gray-600 mt-1">{session?.user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <User className="h-6 w-6 mr-2 text-blue-600" />
              Informasi Profil
            </CardTitle>
            <CardDescription>
              Perbarui informasi profil Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingProfile ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Memuat profil...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base font-semibold">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama lengkap"
                    className="h-11 text-base"
                    disabled={loading}
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    Email
                  </Label>
                  <div className="h-11 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center text-gray-600">
                    {formData.email}
                  </div>
                  <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    Nomor Telepon
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Masukkan nomor telepon"
                    className="h-11 text-base"
                    disabled={loading}
                  />
                </div>

                {/* Institution */}
                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-base font-semibold flex items-center">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    Institusi / Organisasi
                  </Label>
                  <Input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleInputChange}
                    placeholder="Masukkan institusi atau organisasi"
                    className="h-11 text-base"
                    disabled={loading}
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Menyimpan...
                      </div>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="mt-6 shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-lg">Informasi Akun</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Role</p>
                <p className="text-lg font-semibold text-gray-900">
                  {session?.user?.role === 'ADMIN' ? 'Administrator' : 'User'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Email Terverifikasi</p>
                <p className="text-lg font-semibold text-green-600">Terverifikasi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
