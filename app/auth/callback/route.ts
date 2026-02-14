import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const { searchParams } = requestUrl
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const baseUrl = requestUrl.origin

    // Handle OAuth errors from provider
    if (error) {
      console.error('[v0] OAuth error from provider:', error)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error)}`, baseUrl)
      )
    }

    // Handle successful OAuth callback with code
    if (code) {
      const supabase = await createClient()
      
      // Exchange authorization code for a session
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[v0] Session exchange error:', exchangeError)
        return NextResponse.redirect(
          new URL('/auth/login?error=session_exchange_failed', baseUrl)
        )
      }

      // Successful authentication - redirect to dashboard
      console.log('[v0] Authentication successful, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', baseUrl))
    }

    // No code or error - redirect back to login
    console.warn('[v0] No code or error in callback')
    return NextResponse.redirect(new URL('/auth/login', baseUrl))
  } catch (err) {
    console.error('[v0] Callback route error:', err)
    // Fallback redirect to login on any error
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', new URL(request.url).origin))
  }
}
