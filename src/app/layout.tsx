import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { createClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Study Buddy',
  description: 'Process study materials efficiently',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  createClient()

  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
