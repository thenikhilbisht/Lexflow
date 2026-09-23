import { NextResponse } from 'next/server';
import { getSessionCookieOptions } from '@/lib/auth';

export async function POST() {
  const cookieOpts = getSessionCookieOptions();
  const response = NextResponse.json({ success: true, redirect: '/login' });

  // Expire the session cookie immediately
  response.cookies.set({
    name: cookieOpts.name,
    value: '',
    httpOnly: cookieOpts.httpOnly,
    secure: cookieOpts.secure,
    sameSite: cookieOpts.sameSite,
    path: cookieOpts.path,
    maxAge: 0
  });

  return response;
}
