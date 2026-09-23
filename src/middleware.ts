import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_COOKIE_NAME = 'lexiguide_session';

interface SessionPayload {
  userId: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  expiresAt: number;
}

function parseSessionCookie(token: string): SessionPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    // Decode base64url payload
    const base64 = parts[0].replace(/-/g, '+').replace(/_/g, '/');
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (e) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const session = sessionCookie?.value ? parseSessionCookie(sessionCookie.value) : null;

  // 1. Protected User App Routes (/app/*)
  if (pathname.startsWith('/app')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // 2. Protected Admin Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Strict RBAC: normal users can NEVER access /admin
    if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
      // Redirect unauthorized users to user app
      return NextResponse.redirect(new URL('/app', request.url));
    }

    return NextResponse.next();
  }

  // 3. Auth Routes (/login, /register) when already logged in
  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*', '/login', '/register']
};
