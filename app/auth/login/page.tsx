'use client'

import { Suspense } from 'react'
import LoginContent from './login-content'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <div className="animate-pulse bg-muted h-64 rounded-lg" />
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
