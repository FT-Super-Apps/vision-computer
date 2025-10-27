'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, CreditCard, Calendar, User, FileImage } from 'lucide-react'
import Image from 'next/image'

interface Package {
  id: string
  code: string
  name: string
  description: string
  price: number
  currency: string
  validityDays: number
}

function PaymentForm() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const packageId = searchParams.get('packageId')

  const [pkg, setPackage] = useState<Package | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    paymentMethod: '',
    accountName: '',
    accountNumber: '',
    amount: '',
    transactionDate: '',
    notes: '',
    file: null as File | null,
  })

  useEffect(() => {
    if (!packageId) {
      router.push('/subscription/select-package')
      return
    }

    fetchPackage()
  }, [packageId])

  const fetchPackage = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()

      if (data.success) {
        const selectedPkg = data.data.find((p: Package) => p.id === packageId)
        if (selectedPkg) {
          setPackage(selectedPkg)
          setFormData((prev) => ({
            ...prev,
            amount: selectedPkg.price.toString(),
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching package:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar (JPEG, PNG, WebP)')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB')
        return
      }

      setFormData({ ...formData, file })
      setError('')

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)
    setError('')

    if (!formData.file) {
      setError('Silakan upload bukti pembayaran')
      setUploading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('file', formData.file)
      formDataToSend.append('packageId', packageId!)
      formDataToSend.append('paymentMethod', formData.paymentMethod)
      formDataToSend.append('accountName', formData.accountName)
      formDataToSend.append('accountNumber', formData.accountNumber || '')
      formDataToSend.append('amount', formData.amount)
      formDataToSend.append('transactionDate', formData.transactionDate)
      formDataToSend.append('notes', formData.notes || '')

      const response = await fetch('/api/payment/upload', {
        method: 'POST',
        body: formDataToSend,
      })

      const data = await response.json()

      if (data.success) {
        // Redirect to verification status page
        router.push('/subscription/verification-status')
      } else {
        setError(data.error || 'Gagal upload bukti pembayaran')
      }
    } catch (error) {
      setError('Terjadi kesalahan. Silakan coba lagi.')
    } finally {
      setUploading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50">
        <Card className="p-8 text-center shadow-xl border-2">
          <p className="text-gray-600 mb-4">Paket tidak ditemukan</p>
          <Button onClick={() => router.push('/subscription/select-package')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            Kembali
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">🏠</span>
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Rumah Plagiasi
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Bukti Pembayaran
          </h1>
          <p className="text-gray-600">
            Paket: {pkg.name} - {formatPrice(pkg.price)}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Payment Instructions */}
          <Card className="p-6 shadow-xl border-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Informasi Pembayaran
            </h2>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-2">
                  Transfer ke:
                </p>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>
                    <p className="font-semibold">Bank BCA</p>
                    <p>No. Rek: 1234567890</p>
                    <p>a.n. Rumah Plagiasi</p>
                  </div>
                  <div className="border-t border-blue-300 pt-2 mt-2">
                    <p className="font-semibold">Bank Mandiri</p>
                    <p>No. Rek: 0987654321</p>
                    <p>a.n. Rumah Plagiasi</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm font-semibold text-yellow-900 mb-2">
                  Total Pembayaran:
                </p>
                <p className="text-2xl font-bold text-yellow-900">
                  {formatPrice(pkg.price)}
                </p>
              </div>

              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-semibold">Instruksi:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Transfer sesuai nominal paket yang dipilih</li>
                  <li>Simpan bukti transfer</li>
                  <li>Upload bukti transfer melalui form di samping</li>
                  <li>Tunggu verifikasi dari admin (maks 1x24 jam)</li>
                  <li>Setelah diverifikasi, akun akan aktif</li>
                </ol>
              </div>
            </div>
          </Card>

          {/* Upload Form */}
          <Card className="p-6 shadow-xl border-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="paymentMethod">
                  Metode Pembayaran <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  placeholder="Transfer Bank BCA"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountName">
                  Nama Pengirim <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="accountName"
                  name="accountName"
                  value={formData.accountName}
                  onChange={handleChange}
                  placeholder="Nama sesuai rekening"
                  required
                />
              </div>

              <div>
                <Label htmlFor="accountNumber">Nomor Rekening/E-Wallet</Label>
                <Input
                  id="accountNumber"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="1234567890"
                />
              </div>

              <div>
                <Label htmlFor="amount">
                  Jumlah Transfer <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder={pkg.price.toString()}
                  required
                />
              </div>

              <div>
                <Label htmlFor="transactionDate">
                  Tanggal Transfer <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="transactionDate"
                  name="transactionDate"
                  type="date"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="notes">Catatan (Opsional)</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Catatan tambahan..."
                />
              </div>

              <div>
                <Label htmlFor="file">
                  Bukti Transfer <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2">
                  <label
                    htmlFor="file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors"
                  >
                    {previewUrl ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={previewUrl}
                          alt="Preview"
                          fill
                          className="object-contain rounded-lg p-2"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          Klik untuk upload gambar
                        </p>
                        <p className="text-xs text-gray-500">
                          JPEG, PNG, WebP (Max 5MB)
                        </p>
                      </div>
                    )}
                    <input
                      id="file"
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/subscription/select-package')}
                  className="flex-1 h-11"
                >
                  Kembali
                </Button>
                <Button
                  type="submit"
                  disabled={uploading || !formData.file}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {uploading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Mengupload...
                    </div>
                  ) : (
                    'Upload Bukti'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentForm />
    </Suspense>
  )
}
