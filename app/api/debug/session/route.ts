import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()

    // Log all cookies
    console.log('[v0] All cookies:', allCookies.map(c => ({ name: c.name, value: c.value.substring(0, 50) })))

    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log('[v0] Session debug - user:', user?.id, 'error:', error?.message)

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    console.log('[v0] Session:', session?.user?.id)

    return NextResponse.json({
      user: user ? { id: user.id, email: user.email } : null,
      session: session ? { user_id: session.user.id } : null,
      cookies: allCookies.map(c => ({ name: c.name, length: c.value.length })),
      error: error?.message,
    })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] Debug endpoint error:', errorMsg)
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    )
  }
}
