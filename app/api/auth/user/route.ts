import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get the current user from the session
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log('[v0] User endpoint - user:', user?.id, 'error:', error?.message)

    if (error || !user) {
      console.error('[v0] Auth error in user endpoint:', error?.message)
      return NextResponse.json(
        { error: 'Unauthorized', details: error?.message },
        { status: 401 }
      )
    }

    // Return the user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      },
    })

    return response
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error('[v0] User endpoint error:', errorMsg)
    return NextResponse.json(
      { error: 'Internal server error', details: errorMsg },
      { status: 500 }
    )
  }
}
