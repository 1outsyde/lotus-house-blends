import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) return NextResponse.next()
  if (pathname.startsWith('/admin/login')) return NextResponse.next()

  const refreshToken = request.cookies.get('outsyde_access_token')?.value

  if (!refreshToken) {
    return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
