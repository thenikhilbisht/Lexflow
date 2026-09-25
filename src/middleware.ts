export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/auth/token';

const SESSION_COOKIE_NAME = 'lexiguide_session';

const SECURITY_HEADERS = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self' https://generativelanguage.googleapis.com;"
};

function applySecurityHeaders(res: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, val]) => {
    res.headers.set(key, val);
  });
  return res;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? verifySessionToken(sessionCookie.value) : null;

  // 1. Protected User App Routes (/app/*)
  if (pathname.startsWith('/app')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 2. Protected Admin App Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return applySecurityHeaders(NextResponse.redirect(loginUrl));
    }

    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return applySecurityHeaders(NextResponse.redirect(new URL('/app', request.url)));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  // 3. Protected Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    if (!session) {
      return applySecurityHeaders(NextResponse.json({ error: 'Authentication required' }, { status: 401 }));
    }
    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      return applySecurityHeaders(NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 }));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 4. Protected User API Routes (/api/documents/*, /api/compare/*, /api/checklists/*, /api/timeline/*)
  if (
    pathname.startsWith('/api/documents') ||
    pathname.startsWith('/api/compare') ||
    pathname.startsWith('/api/checklists') ||
    pathname.startsWith('/api/timeline')
  ) {
    if (!session) {
      return applySecurityHeaders(NextResponse.json({ error: 'Authentication required' }, { status: 401 }));
    }
    return applySecurityHeaders(NextResponse.next());
  }

  // 5. Auth Routes (/login, /register) when already authenticated
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      const dest = (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') ? '/admin' : '/app';
      return applySecurityHeaders(NextResponse.redirect(new URL(dest, request.url)));
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    '/app/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/api/admin/:path*',
    '/api/documents/:path*',
    '/api/compare/:path*',
    '/api/checklists/:path*',
    '/api/timeline/:path*'
  ]
};
