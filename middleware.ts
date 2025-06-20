import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/api/', '/_next', '/favicon.ico'];

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_PATHS.some((path) => pathname.startsWith(path));

  // Basic check for supabase cookie
  const isAuth = req.cookies.has('sb-access-token');

  if (!isAuth && !isPublic) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/generate/:path*', '/workflows/:path*', '/settings/:path*', '/feedback/:path*', '/admin/:path*']
}; 