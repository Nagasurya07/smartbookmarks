import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response = NextResponse.next(
                {
                  request: {
                    headers: request.headers,
                  },
                },
                response,
              )
              response.cookies.set(name, value, options)
            })
          },
        },
      },
    )

    // Refresh session
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Redirect to login if user is not authenticated and trying to access protected routes
    if (!user) {
      const { pathname } = request.nextUrl

      // Protected routes that require authentication
      if (pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
      }
    }

    return response
  } catch (e) {
    // If middleware error, let it pass through
    return NextResponse.next({
      request: {
        headers: request.headers,
      },
    })
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
