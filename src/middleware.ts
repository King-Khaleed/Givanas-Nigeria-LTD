
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/lib/types'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
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
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  
  const publicRoutes = ['/login', '/register', '/auth/callback']
  
  // Allow the initial redirect from login to dashboard to pass through
  const isRedirectingFromLogin = request.headers.get('referer')?.endsWith('/login');
  
  if (!session && !publicRoutes.includes(pathname) && !isRedirectingFromLogin) {
    if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (publicRoutes.includes(pathname) || pathname === '/') {
        let redirectTo = '/dashboard';
        if (profile?.role === 'admin') redirectTo = '/admin';
        if (profile?.role === 'staff') redirectTo = '/dashboard/staff';
        if (profile?.role === 'client') redirectTo = '/dashboard/client';
        return NextResponse.redirect(new URL(redirectTo, request.url))
      }

      // Role-based route protection
      if (pathname.startsWith('/admin') && profile?.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
       if (pathname.startsWith('/dashboard/staff') && profile?.role !== 'staff') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
       if (pathname.startsWith('/dashboard/client') && profile?.role !== 'client') {
          return NextResponse.redirect(new URL('/dashboard', request.url))
      }
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
