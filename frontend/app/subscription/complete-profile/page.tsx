'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Phone, MapPin, Building2, GraduationCap, CheckCircle2, Circle, Save } from 'lucide-react'

const STORAGE_KEY = 'complete_profile_draft'

export default function CompleteProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [loadedFromDraft, setLoadedFromDraft] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postalCode: '',
    institution: '',
    major: '',
    studentId: '',
    purpose: '',
  })

  // Load existing profile or draft on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load existing profile from API
        const response = await fetch('/api/profile/complete')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            setFormData({
              fullName: data.data.fullName || '',
              phone: data.data.phone || '',
              address: data.data.address || '',
              city: data.data.city || '',
              province: data.data.province || '',
              postalCode: data.data.postalCode || '',
              institution: data.data.institution || '',
              major: data.data.major || '',
              studentId: data.data.studentId || '',
              purpose: data.data.purpose || '',
            })
            return
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error)
      }

      // If no profile, try to load draft from localStorage
      const savedDraft = localStorage.getItem(STORAGE_KEY)
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft)
          setFormData(draft.data)
          setLoadedFromDraft(true)
          setLastSaved(new Date(draft.timestamp))
        } catch (error) {
          console.error('Error loading draft:', error)
        }
      }
    }

    loadData()
  }, [])

  // Auto-save to localStorage
  const saveDraft = useCallback(() => {
    const draft = {
      data: formData,
      timestamp: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
    setLastSaved(new Date())
    setLoadedFromDraft(false)
  }, [formData])

  // Auto-save when form data changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if there's any data entered
      const hasData = Object.values(formData).some(value => value.trim() !== '')
      if (hasData) {
        saveDraft()
      }
    }, 2000) // Save after 2 seconds of no typing

    return () => clearTimeout(timer)
  }, [formData, saveDraft])

  // Calculate completion progress
  const calculateProgress = () => {
    const fields = Object.values(formData)
    const filledFields = fields.filter(value => value.trim() !== '').length
    return Math.round((filledFields / fields.length) * 100)
  }

  // Check section completion
  const isSectionComplete = (section: string) => {
    switch (section) {
      case 'personal':
        return formData.fullName.trim() !== '' && formData.phone.trim() !== ''
      case 'address':
        return formData.address.trim() !== '' && formData.city.trim() !== '' && formData.province.trim() !== ''
      case 'academic':
        return formData.institution.trim() !== '' && formData.major.trim() !== ''
      default:
        return false
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        // Clear draft from localStorage
        localStorage.removeItem(STORAGE_KEY)
        // Profile completed, redirect to package selection
        router.push('/subscription/select-package')
      } else {
        setError(data.error || 'Gagal melengkapi profil')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const progress = calculateProgress()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">🏠</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Rumah Plagiasi
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Lengkapi Profil Anda
            </h1>
            <p className="text-gray-600">
              Silakan lengkapi data diri Anda untuk melanjutkan
            </p>
          </div>

          {/* Progress Bar */}
          <Card className="p-6 shadow-lg border-2">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">Progress Pengisian</h3>
                <p className="text-sm text-gray-600">
                  {progress === 100 ? 'Semua data telah dilengkapi!' : `${progress}% telah dilengkapi`}
                </p>
              </div>
              <div className="text-3xl font-bold text-blue-600">{progress}%</div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Auto-save indicator */}
            {lastSaved && (
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Save className="h-3 w-3" />
                  <span>Tersimpan otomatis: {lastSaved.toLocaleTimeString('id-ID')}</span>
                </div>
                {loadedFromDraft && (
                  <span className="text-blue-600 font-medium">✓ Draft dimuat</span>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Form Card */}
        <Card className="p-8 shadow-xl border-2">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* Section 1: Personal Information */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSectionComplete('personal')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {isSectionComplete('personal') ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Informasi Pribadi</h2>
                    <p className="text-sm text-gray-500">Data diri Anda</p>
                  </div>
                </div>
                {isSectionComplete('personal') && (
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Lengkap
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 pl-13">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Nama lengkap sesuai KTP"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="08123456789"
                    required
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Section 2: Address */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSectionComplete('address')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {isSectionComplete('address') ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <MapPin className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Alamat</h2>
                    <p className="text-sm text-gray-500">Informasi lokasi Anda</p>
                  </div>
                </div>
                {isSectionComplete('address') && (
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Lengkap
                  </span>
                )}
              </div>

              <div className="space-y-4 pl-13">
                <div>
                  <Label htmlFor="address" className="text-sm font-medium">Alamat Lengkap</Label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Jalan, nomor rumah, RT/RW"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium">Kota/Kabupaten</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Jakarta"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="province" className="text-sm font-medium">Provinsi</Label>
                    <Input
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      placeholder="DKI Jakarta"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="postalCode" className="text-sm font-medium">Kode Pos</Label>
                    <Input
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      placeholder="12345"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Section 3: Academic Information */}
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isSectionComplete('academic')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {isSectionComplete('academic') ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <GraduationCap className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Informasi Akademik</h2>
                    <p className="text-sm text-gray-500">Data institusi pendidikan</p>
                  </div>
                </div>
                {isSectionComplete('academic') && (
                  <span className="text-sm font-medium text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Lengkap
                  </span>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4 pl-13">
                <div>
                  <Label htmlFor="institution" className="text-sm font-medium">Universitas/Sekolah</Label>
                  <Input
                    id="institution"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Universitas Indonesia"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="major" className="text-sm font-medium">Jurusan/Program Studi</Label>
                  <Input
                    id="major"
                    name="major"
                    value={formData.major}
                    onChange={handleChange}
                    placeholder="Teknik Informatika"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="studentId" className="text-sm font-medium">NIM/NIS</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    placeholder="1234567890"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="purpose" className="text-sm font-medium">Tujuan Penggunaan</Label>
                  <Input
                    id="purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Skripsi, Tesis, dll"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="h-11"
              >
                Kembali
              </Button>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={saveDraft}
                  className="h-11"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Simpan Draft
                </Button>
                <Button
                  type="submit"
                  disabled={loading || progress < 20}
                  className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all min-w-[140px]"
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
                    'Lanjutkan'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <Save className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-blue-900">Auto-Save Aktif</h4>
                <p className="text-xs text-blue-700 mt-1">Data otomatis tersimpan setiap 2 detik</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-green-900">Progress Tersimpan</h4>
                <p className="text-xs text-green-700 mt-1">Anda bisa melanjutkan kapan saja</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-purple-50 border-purple-200">
            <div className="flex items-start space-x-3">
              <Circle className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm text-purple-900">Data Aman</h4>
                <p className="text-xs text-purple-700 mt-1">Informasi Anda terlindungi</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Required Fields Note */}
        <p className="text-sm text-gray-500 text-center mt-4">
          <span className="text-red-500">*</span> Field wajib diisi untuk melanjutkan
        </p>
      </div>
    </div>
  )
}
