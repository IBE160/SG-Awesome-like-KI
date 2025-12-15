'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'

const HIDDEN_HEADER_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export function HeaderWrapper() {
  const pathname = usePathname()
  const shouldHideHeader = HIDDEN_HEADER_PATHS.some(path => pathname.startsWith(path))

  if (shouldHideHeader) {
    return null
  }

  return <Header />
}
