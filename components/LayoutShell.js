'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import Sidebar from './Sidebar'

export default function LayoutShell({ children }) {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    if (user === null && !isLoginPage) {
      router.replace('/login')
    } else if (user && isLoginPage) {
      router.replace('/')
    }
  }, [user, isLoginPage])

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Memuat...</p>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  if (!user) return null

  return (
    <>
      <Sidebar />
      <main className="md:ml-64 min-h-screen">
        <div className="pt-16 px-4 pb-8 md:pt-8 md:px-8 md:pb-8">
          {children}
        </div>
      </main>
    </>
  )
}
