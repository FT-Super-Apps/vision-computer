import { Metadata } from 'next'
import LandingClient from './landing-client'
import { PackageData, getFallbackPackages } from '@/lib/fallback-packages'

export const metadata: Metadata = {
  title: 'Rumah Plagiasi - Solusi Bypass Plagiarism Terpercaya',
  description: 'Platform terpercaya untuk membantu Anda melewati sistem deteksi plagiarism dengan teknologi AI terkini. Cepat, aman, dan terjamin hasilnya.',
  keywords: 'plagiarism, bypass, dokumen, turnitin, academic, mahasiswa',
  openGraph: {
    title: 'Rumah Plagiasi - Solusi Bypass Plagiarism Terpercaya',
    description: 'Platform terpercaya untuk membantu Anda melewati sistem deteksi plagiarism dengan teknologi AI terkini.',
    type: 'website',
  },
}

// Revalidate every 5 minutes (300 seconds)
export const revalidate = 300

/**
 * Fetch packages from API with fallback to static data
 * This runs on the server at build time and on revalidation
 */
async function fetchPackages(): Promise<PackageData[]> {
  try {
    // Try to fetch from API
    // Use absolute URL in production, relative in development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/packages`, {
      next: { revalidate: 300 }, // Revalidate every 5 minutes
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.warn('Failed to fetch packages from API, using fallback data')
      return getFallbackPackages()
    }

    const data = await response.json()

    if (data.success && data.data && Array.isArray(data.data)) {
      // Transform API data to match PackageData interface
      const packages: PackageData[] = data.data.map((pkg: any) => ({
        ...pkg,
        popular: pkg.code === 'HASIL', // Mark HASIL package as popular
      }))

      console.log(`Successfully fetched ${packages.length} packages from API`)
      return packages
    }

    // If data format is unexpected, use fallback
    console.warn('API returned unexpected data format, using fallback')
    return getFallbackPackages()
  } catch (error) {
    // If fetch fails (API down, network error, etc), use fallback data
    console.error('Error fetching packages, using fallback data:', error)
    return getFallbackPackages()
  }
}

/**
 * Landing Page - Server Component
 *
 * This component fetches packages data on the server and passes it to the client component.
 * Benefits:
 * - Faster initial page load (no client-side fetch delay)
 * - Better SEO (search engines can see pricing)
 * - Automatic fallback to static data if API fails
 * - Data cached and revalidated every 5 minutes
 */
export default async function LandingPage() {
  // Fetch packages on server
  const packages = await fetchPackages()

  // Pass data to client component
  return <LandingClient packages={packages} />
}
