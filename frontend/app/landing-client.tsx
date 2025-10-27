'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  CheckCircle2,
  Shield,
  Zap,
  FileText,
  Clock,
  Users,
  ArrowRight,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  Menu,
  X
} from 'lucide-react'
import { PackageData } from '@/lib/fallback-packages'

interface LandingClientProps {
  packages: PackageData[]
}

export default function LandingClient({ packages }: LandingClientProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/register')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-purple-100 to-blue-100 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🏠</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Rumah Plagiasi
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                Fitur
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                Harga
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
                Testimoni
              </a>
            </div>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {session ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Dashboard
                </Button>
              ) : (
                <>
                  <Link href="/auth/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Masuk
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Daftar Gratis
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200 bg-white">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 transition font-medium">
                  Fitur
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition font-medium">
                  Harga
                </a>
                <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition font-medium">
                  Testimoni
                </a>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  {session ? (
                    <Button
                      onClick={() => router.push('/dashboard')}
                      className="bg-gray-900 hover:bg-gray-800"
                    >
                      Dashboard
                    </Button>
                  ) : (
                    <>
                      <Link href="/auth/login">
                        <Button variant="ghost" className="w-full">
                          Masuk
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Daftar Gratis
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded-full mb-8">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Solusi Terpercaya untuk Dokumen Anda</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Bypass Plagiarism Detection
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dengan Mudah & Aman
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Platform terpercaya untuk membantu Anda melewati sistem deteksi plagiarism
              dengan teknologi AI terkini. Cepat, aman, dan terjamin hasilnya.
            </p>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
              >
                Mulai Sekarang
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 border-2"
              >
                Lihat Harga
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">1000+</div>
                <div className="text-gray-600 font-medium">Dokumen Diproses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                <div className="text-gray-600 font-medium">Tingkat Sukses</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                <div className="text-gray-600 font-medium">Pengguna Aktif</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">24/7</div>
                <div className="text-gray-600 font-medium">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kenapa Memilih Kami?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Kami menyediakan solusi terbaik dengan fitur-fitur unggulan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Proses Super Cepat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Dokumen Anda diproses dalam hitungan menit. Tidak perlu menunggu lama untuk mendapatkan hasil terbaik.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                100% Aman & Privat
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Data Anda dijamin aman. Kami tidak menyimpan atau membagikan dokumen Anda kepada pihak manapun.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Multi Format
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Mendukung berbagai format dokumen: DOCX, PDF, ODT, dan masih banyak lagi.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Tingkat Sukses Tinggi
              </h3>
              <p className="text-gray-600 leading-relaxed">
                98% tingkat keberhasilan dalam melewati sistem deteksi plagiarism terkenal.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Support 24/7
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tim kami siap membantu Anda kapan saja. Chat, email, atau telepon - kami ada untuk Anda.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow duration-300 border">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-6">
                <Award className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Garansi Kepuasan
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Tidak puas? Kami berikan revisi gratis atau uang kembali 100%. Kepuasan Anda prioritas kami.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pilih Paket yang Sesuai
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Harga terjangkau dengan hasil maksimal
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative p-8 ${
                  pkg.popular
                    ? 'border-2 border-blue-500 shadow-xl'
                    : 'border'
                } transition-all duration-300 hover:shadow-xl`}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Terpopuler
                    </span>
                  </div>
                )}

                <div className="text-center mb-8 mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {pkg.name}
                  </h3>
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {pkg.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(pkg.price)}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-2">
                    {pkg.validityDays} hari
                  </p>
                </div>

                <div className="space-y-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={session ? '/subscription/select-package' : '/auth/register'}>
                  <Button
                    className={`w-full ${
                      pkg.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-900 hover:bg-gray-800 text-white'
                    }`}
                    size="lg"
                  >
                    Pilih Paket
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Apa Kata Mereka?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Testimoni dari pengguna yang puas
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Sangat membantu untuk skripsi saya! Prosesnya cepat dan hasilnya memuaskan. Highly recommended!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  AS
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Andi Saputra</div>
                  <div className="text-sm text-gray-500">Mahasiswa UI</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Pelayanan terbaik! Admin responsif dan membantu. Dokumen saya lolos dengan mudah."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  SP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Siti Permata</div>
                  <div className="text-sm text-gray-500">Mahasiswa UGM</div>
                </div>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-shadow">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                "Harga terjangkau untuk mahasiswa. Kualitas premium dengan harga yang masuk akal!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                  BP
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Budi Pratama</div>
                  <div className="text-sm text-gray-500">Mahasiswa ITB</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Siap Untuk Memulai?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Bergabunglah dengan ratusan mahasiswa yang telah mempercayai kami
          </p>
          <Button
            onClick={handleGetStarted}
            size="lg"
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all"
          >
            Daftar Sekarang - GRATIS
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl font-bold">🏠</span>
                </div>
                <span className="text-2xl font-bold">Rumah Plagiasi</span>
              </div>
              <p className="text-gray-400 mb-4">
                Solusi terpercaya untuk membantu Anda melewati sistem deteksi plagiarism dengan aman dan mudah.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Menu</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#features" className="hover:text-white transition">Fitur</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Harga</a></li>
                <li><a href="#testimonials" className="hover:text-white transition">Testimoni</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Bantuan</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Kontak</a></li>
                <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Rumah Plagiasi. Dibuat dengan ❤️ oleh devnolife</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
