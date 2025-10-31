/**
 * Fallback Packages Data
 *
 * This file provides static package data as a fallback when the API is unavailable.
 * Used by the landing page to ensure pricing is always displayed.
 */

export interface PackageData {
  id: string
  code: string
  name: string
  description: string
  price: number
  validityDays: number
  features: string[]
  popular?: boolean
  isActive?: boolean
}

/**
 * Default package data
 * These values should match the database seed data for consistency
 */
const FALLBACK_PACKAGES: PackageData[] = [
  {
    id: '1',
    code: 'BASIC',
    name: 'Paket Basic',
    description: 'Cocok untuk mahasiswa yang butuh bantuan sesekali',
    price: 50000,
    validityDays: 30,
    features: [
      '5 dokumen per bulan',
      'Proses dalam 24 jam',
      'Support via email',
      'Format DOCX & PDF',
    ],
    popular: false,
    isActive: true,
  },
  {
    id: '2',
    code: 'HASIL',
    name: 'Paket Hasil',
    description: 'Paket terpopuler dengan fitur lengkap',
    price: 100000,
    validityDays: 30,
    features: [
      '15 dokumen per bulan',
      'Proses dalam 12 jam',
      'Priority support',
      'Semua format dokumen',
      'Revisi gratis 1x',
    ],
    popular: true,
    isActive: true,
  },
  {
    id: '3',
    code: 'PREMIUM',
    name: 'Paket Premium',
    description: 'Untuk kebutuhan profesional dan mendesak',
    price: 200000,
    validityDays: 30,
    features: [
      'Unlimited dokumen',
      'Proses dalam 6 jam',
      '24/7 priority support',
      'Semua format dokumen',
      'Revisi unlimited',
      'Garansi 100%',
    ],
    popular: false,
    isActive: true,
  },
]

/**
 * Get fallback packages
 * Returns a copy of the fallback packages array
 */
export function getFallbackPackages(): PackageData[] {
  return FALLBACK_PACKAGES.map(pkg => ({ ...pkg }))
}

/**
 * Get a specific package by code
 */
export function getFallbackPackageByCode(code: string): PackageData | undefined {
  return FALLBACK_PACKAGES.find(pkg => pkg.code === code)
}

/**
 * Get the popular package
 */
export function getPopularPackage(): PackageData | undefined {
  return FALLBACK_PACKAGES.find(pkg => pkg.popular)
}
