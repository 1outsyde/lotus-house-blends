import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  // The backend sets 'refreshToken' as the only httpOnly cookie.
  // Access tokens live in localStorage — the browser never sends them in cookies.
  // If refreshToken is absent the user definitely has no session.
  const refreshToken = request.cookies.get('refreshToken')?.value

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
