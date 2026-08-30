import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const currentPath = request.nextUrl.pathname

  // Canonicalize domain: always redirect www -> apex.
  const hostHeader = request.headers.get('x-forwarded-host') ?? request.headers.get('host') ?? ''
  const host = hostHeader.split(':')[0].toLowerCase()
  if (host === 'www.caterly.com.au') {
    const redirectUrl = new URL(request.url)
    redirectUrl.protocol = 'https:'
    redirectUrl.host = 'caterly.com.au'
    return NextResponse.redirect(redirectUrl, 308)
  }

  const response = NextResponse.next()

  // Prevent caching for HTML pages (fixes stale page issues on Railway)
  if (!currentPath.startsWith('/_next/static')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|assets/).*)'],
}
