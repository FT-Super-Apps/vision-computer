'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'

interface Package {
  id: string
  code: string
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  maxDocuments: number
  maxFileSize: number
  validityDays: number
  order: number
}

export default function SelectPackagePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated') {
      fetchPackages()
    }
  }, [status, router])

  const fetchPackages = async () => {
    try {
      const response = await fetch('/api/packages')
      const data = await response.json()

      if (data.success) {
        setPackages(data.data)
      }
    } catch (error) {
      console.error('Error fetching packages:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPackage = (packageId: string) => {
    setSelectedPackage(packageId)
  }

  const handleContinue = () => {
    if (selectedPackage) {
      router.push(`/subscription/payment?packageId=${selectedPackage}`)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Pilih Paket Berlangganan
          </h1>
          <p className="text-lg text-gray-600">
            Pilih paket yang sesuai dengan kebutuhan Anda
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative p-8 cursor-pointer transition-all duration-200 ${
                selectedPackage === pkg.id
                  ? 'ring-2 ring-blue-600 shadow-xl transform scale-105'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => handleSelectPackage(pkg.id)}
            >
              {/* Popular Badge for middle package */}
              {pkg.code === 'HASIL' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Populer
                  </span>
                </div>
              )}

              {/* Selected Indicator */}
              {selectedPackage === pkg.id && (
                <div className="absolute top-4 right-4">
                  <CheckCircle2 className="h-8 w-8 text-blue-600" />
                </div>
              )}

              {/* Package Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-900">
                    {formatPrice(pkg.price)}
                  </span>
                  <span className="text-gray-500 ml-2">
                    / {pkg.validityDays} hari
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Select Button */}
              <Button
                className={`w-full ${
                  selectedPackage === pkg.id
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
                onClick={() => handleSelectPackage(pkg.id)}
              >
                {selectedPackage === pkg.id ? 'Dipilih' : 'Pilih Paket'}
              </Button>
            </Card>
          ))}
        </div>

        {/* Continue Button */}
        {selectedPackage && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12"
              onClick={handleContinue}
            >
              Lanjut ke Pembayaran
            </Button>
          </div>
        )}

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-gray-600 text-sm">
            Butuh bantuan? Hubungi customer service kami
          </p>
        </div>
      </div>
    </div>
  )
}
