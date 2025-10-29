import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthSessionProvider from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rumah Plagiasi - Document Bypass Tool',
  description: 'Modern document bypass system with AI-powered analysis. Created by devnolife',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <AuthSessionProvider>{children}</AuthSessionProvider>
        <Toaster />
      </body>
    </html>
  )
}
