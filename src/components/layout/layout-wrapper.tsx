'use client'

import { usePathname } from 'next/navigation'
import { Header } from './header'
import { Sidebar } from './sidebar'

const EXCLUDED_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isExcludedPath = EXCLUDED_PATHS.some(path => pathname.startsWith(path))

  if (isExcludedPath) {
    return <>{children}</>
  }

  return (
    <>
      <Header pathname={pathname} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:ml-64">
          {children}
        </main>
      </div>
    </>
  )
}

