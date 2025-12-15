import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; expires: Date; httpOnly: boolean; sameSite?: boolean | "lax" | "strict" | "none" | undefined; secure?: boolean | undefined; }) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string) {
          request.cookies.set({
            name,
            value: '',
            expires: new Date(0),
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            expires: new Date(0),
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const LOGIN_PATH = '/login'
  const DASHBOARD_PATH = '/dashboard'
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH
  const isRootPath = request.nextUrl.pathname === '/'

  if (user && isLoginPage) {
    return NextResponse.redirect(new URL(DASHBOARD_PATH, request.url))
  }

  if (!user && (isRootPath || request.nextUrl.pathname.startsWith(DASHBOARD_PATH))) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
