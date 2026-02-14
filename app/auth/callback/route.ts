import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const { searchParams } = requestUrl
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    console.log('[v0] Callback route called with:', { code: !!code, error, error_description })

    // Handle OAuth errors from provider
    if (error) {
      console.error('[v0] OAuth error from provider:', error, error_description)
      return NextResponse.redirect(
        new URL(`/auth/login?error=${encodeURIComponent(error_description || error)}`, requestUrl.origin)
      )
    }

    // Handle successful OAuth callback with code
    if (code) {
      const cookieStore = await cookies()
      
      // Create Supabase client with cookie store for session management
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) => {
                  cookieStore.set(name, value, options)
                })
              } catch (e) {
                console.error('[v0] Error setting cookies:', e)
              }
            },
          },
        }
      )

      // Exchange authorization code for a session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('[v0] Session exchange error:', exchangeError.message)
        return NextResponse.redirect(
          new URL(`/auth/login?error=session_exchange_failed&details=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
        )
      }

      if (!data.session) {
        console.error('[v0] No session returned after code exchange')
        return NextResponse.redirect(
          new URL('/auth/login?error=no_session', requestUrl.origin)
        )
      }

      // Verify user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        console.error('[v0] User not authenticated after session exchange')
        return NextResponse.redirect(
          new URL('/auth/login?error=user_not_found', requestUrl.origin)
        )
      }

      console.log('[v0] Authentication successful for user:', user.id)

      // Create response and redirect to dashboard
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
      
      return response
    }

    // No code or error - redirect back to login
    console.warn('[v0] No code or error in callback')
    return NextResponse.redirect(new URL('/auth/login?error=no_code', requestUrl.origin))
  } catch (err) {
    console.error('[v0] Callback route error:', err instanceof Error ? err.message : err)
    // Fallback redirect to login on any error
    return NextResponse.redirect(new URL('/auth/login?error=callback_error', new URL(request.url).origin))
  }
}
