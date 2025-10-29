'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2, XCircle, Eye, Clock, Filter } from 'lucide-react'
import Image from 'next/image'
import { useToast } from '@/hooks/use-toast'

interface PaymentProof {
  id: string
  status: string
  amount: number
  paymentMethod: string
  accountName: string
  transactionDate: string
  proofImageUrl: string
  createdAt: string
  notes: string | null
  rejectionReason: string | null
  adminNotes: string | null
  user: {
    id: string
    name: string
    email: string
    profile: {
      fullName: string
      phone: string
      institution: string | null
    } | null
  }
  subscription: {
    package: {
      code: string
      name: string
      price: number
      validityDays: number
    }
  }
}

export default function AdminPaymentsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const { toast } = useToast()

  const [payments, setPayments] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const [verificationData, setVerificationData] = useState({
    action: 'VERIFY' as 'VERIFY' | 'REJECT',
    rejectionReason: '',
    adminNotes: '',
  })

  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') {
      router.push('/dashboard')
    } else {
      fetchPayments()
    }
  }, [session, filter])

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/admin/payments/pending?status=${filter}`)
      const data = await response.json()

      if (data.success) {
        setPayments(data.data.paymentProofs)
      }
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (payment: PaymentProof) => {
    setSelectedPayment(payment)
    setShowModal(true)
    setVerificationData({
      action: 'VERIFY',
      rejectionReason: '',
      adminNotes: '',
    })
  }

  const handleCloseDialog = (open: boolean) => {
    setShowModal(open)
    if (!open) {
      // Reset state when dialog closes
      setSelectedPayment(null)
      setVerificationData({
        action: 'VERIFY',
        rejectionReason: '',
        adminNotes: '',
      })
      setVerifying(false)
    }
  }

  const handleVerify = async () => {
    if (!selectedPayment) {
      console.error('No payment selected')
      return
    }

    if (verificationData.action === 'REJECT' && !verificationData.rejectionReason.trim()) {
      toast({
        variant: 'warning',
        title: 'Peringatan',
        description: 'Alasan penolakan harus diisi',
      })
      return
    }

    console.log('Starting verification with data:', {
      paymentProofId: selectedPayment.id,
      action: verificationData.action,
      rejectionReason: verificationData.rejectionReason,
      adminNotes: verificationData.adminNotes,
    })

    setVerifying(true)

    try {
      const response = await fetch('/api/admin/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentProofId: selectedPayment.id,
          action: verificationData.action,
          rejectionReason: verificationData.rejectionReason || null,
          adminNotes: verificationData.adminNotes || null,
        }),
      })

      const data = await response.json()
      console.log('Verification response:', data)

      if (data.success) {
        toast({
          variant: 'success',
          title: 'Berhasil',
          description: data.message,
        })
        setShowModal(false)
        setSelectedPayment(null)
        fetchPayments()
      } else {
        console.error('Verification failed:', data)
        toast({
          variant: 'destructive',
          title: 'Gagal',
          description: data.error || 'Terjadi kesalahan yang tidak diketahui',
        })
      }
    } catch (error) {
      console.error('Error during verification:', error)
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui',
      })
    } finally {
      setVerifying(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Filters */}
      <Card className="p-4 mb-6 border shadow-sm">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-blue-600" />
            <div className="flex space-x-2 flex-wrap gap-2">
              <Button
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilter('PENDING')}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pending
              </Button>
              <Button
                variant={filter === 'VERIFIED' ? 'default' : 'outline'}
                onClick={() => setFilter('VERIFIED')}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Verified
              </Button>
              <Button
                variant={filter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setFilter('REJECTED')}
                size="sm"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejected
              </Button>
              <Button
                variant={filter === 'ALL' ? 'default' : 'outline'}
                onClick={() => setFilter('ALL')}
                size="sm"
              >
                Semua
              </Button>
            </div>
          </div>
        </Card>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card className="p-8 text-center border shadow-sm">
          <p className="text-gray-600">Tidak ada pembayaran dengan status {filter}</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
              <Card key={payment.id} className="p-6 border shadow-sm hover:shadow-md transition-shadow">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* User Info */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User</p>
                    <p className="font-semibold">{payment.user.name}</p>
                    <p className="text-sm text-gray-600">{payment.user.email}</p>
                    {payment.user.profile && (
                      <>
                        <p className="text-sm text-gray-600 mt-2">
                          {payment.user.profile.phone}
                        </p>
                        {payment.user.profile.institution && (
                          <p className="text-sm text-gray-600">
                            {payment.user.profile.institution}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Package & Payment Info */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Paket & Pembayaran</p>
                    <p className="font-semibold">{payment.subscription.package.name}</p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(payment.amount)}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      {payment.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600">
                      {payment.accountName}
                    </p>
                  </div>

                  {/* Dates */}
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Tanggal</p>
                    <p className="text-sm">
                      <span className="text-gray-600">Transfer:</span><br />
                      {formatDate(payment.transactionDate)}
                    </p>
                    <p className="text-sm mt-2">
                      <span className="text-gray-600">Upload:</span><br />
                      {formatDate(payment.createdAt)}
                    </p>
                  </div>

                  {/* Status & Action */}
                  <div className="flex flex-col justify-between">
                    <div>
                      {payment.status === 'PENDING' && (
                        <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Pending
                        </div>
                      )}
                      {payment.status === 'VERIFIED' && (
                        <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Verified
                        </div>
                      )}
                      {payment.status === 'REJECTED' && (
                        <div className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center">
                          <XCircle className="h-4 w-4 mr-1" />
                          Rejected
                        </div>
                      )}
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetails(payment)}
                      className="mt-4"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Lihat Detail
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Verification Modal */}
        <Dialog open={showModal} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Detail Pembayaran
              </DialogTitle>
            </DialogHeader>

            {selectedPayment && (
              <div className="mt-4">

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  {/* Payment Info */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">User</p>
                      <p className="font-semibold">{selectedPayment.user.name}</p>
                      <p className="text-sm">{selectedPayment.user.email}</p>
                      {selectedPayment.user.profile && (
                        <>
                          <p className="text-sm">{selectedPayment.user.profile.fullName}</p>
                          <p className="text-sm">{selectedPayment.user.profile.phone}</p>
                        </>
                      )}
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Paket</p>
                      <p className="font-semibold">
                        {selectedPayment.subscription.package.name}
                      </p>
                      <p className="text-sm">
                        {formatPrice(selectedPayment.subscription.package.price)}
                        ({selectedPayment.subscription.package.validityDays} hari)
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600">Pembayaran</p>
                      <p className="font-semibold">{selectedPayment.paymentMethod}</p>
                      <p className="text-sm">a.n. {selectedPayment.accountName}</p>
                      <p className="text-sm">
                        Jumlah: {formatPrice(selectedPayment.amount)}
                      </p>
                    </div>

                    {selectedPayment.notes && (
                      <div>
                        <p className="text-sm text-gray-600">Catatan User</p>
                        <p className="text-sm">{selectedPayment.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Payment Proof Image */}
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Bukti Transfer</p>
                    <div className="relative h-96 border border-gray-200 rounded-lg overflow-hidden">
                      <Image
                        src={selectedPayment.proofImageUrl}
                        alt="Bukti Transfer"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                </div>

                {/* Verification Form (only for PENDING) */}
                {selectedPayment.status === 'PENDING' && (
                  <div className="border-t pt-6 space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Pilih Aksi</Label>
                      <div className="flex space-x-4 mt-2">
                        <Button
                          type="button"
                          onClick={() => setVerificationData({ ...verificationData, action: 'VERIFY' })}
                          className={`flex-1 h-12 font-semibold ${
                            verificationData.action === 'VERIFY'
                              ? 'bg-green-600 hover:bg-green-700 text-white border-green-600'
                              : 'bg-white hover:bg-green-50 text-green-600 border-2 border-green-600'
                          }`}
                        >
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          Verifikasi
                        </Button>
                        <Button
                          type="button"
                          onClick={() => setVerificationData({ ...verificationData, action: 'REJECT' })}
                          className={`flex-1 h-12 font-semibold ${
                            verificationData.action === 'REJECT'
                              ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
                              : 'bg-white hover:bg-red-50 text-red-600 border-2 border-red-600'
                          }`}
                        >
                          <XCircle className="h-5 w-5 mr-2" />
                          Tolak
                        </Button>
                      </div>
                    </div>

                    {verificationData.action === 'REJECT' && (
                      <div>
                        <Label htmlFor="rejectionReason">
                          Alasan Penolakan <span className="text-red-500">*</span>
                        </Label>
                        <textarea
                          id="rejectionReason"
                          value={verificationData.rejectionReason}
                          onChange={(e) =>
                            setVerificationData({
                              ...verificationData,
                              rejectionReason: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Masukkan alasan penolakan..."
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="adminNotes">Catatan Admin (Opsional)</Label>
                      <textarea
                        id="adminNotes"
                        value={verificationData.adminNotes}
                        onChange={(e) =>
                          setVerificationData({
                            ...verificationData,
                            adminNotes: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        placeholder="Catatan tambahan..."
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => handleCloseDialog(false)}
                    className="h-11"
                  >
                    Tutup
                  </Button>
                  {selectedPayment.status === 'PENDING' && (
                    <Button
                      onClick={handleVerify}
                      disabled={verifying}
                      className={`h-11 text-white font-semibold ${
                        verificationData.action === 'VERIFY'
                          ? 'bg-green-600 hover:bg-green-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {verifying ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Memproses...
                        </div>
                      ) : verificationData.action === 'VERIFY' ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verifikasi Pembayaran
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Tolak Pembayaran
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  )
}
