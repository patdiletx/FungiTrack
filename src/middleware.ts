import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // This `response` object is mutable and will be modified by the `set` and `remove`
  // methods on the Supabase client.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a Supabase client that can be used to read and write cookies.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is set, update the `response` object to set it.
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the `response` object to delete it.
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session if it's expired.
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // If the user is not signed in and is trying to access a protected route,
  // redirect them to the home page.
  if (!user && pathname.startsWith('/panel')) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  // If the user is signed in and is trying to access the home page,
  // redirect them to the dashboard.
  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/panel', request.url))
  }

  // Return the response object to continue with the request.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - lote/ (public qr code pages)
     */
    '/((?!_next/static|_next/image|favicon.ico|lote).*)',
  ],
}
