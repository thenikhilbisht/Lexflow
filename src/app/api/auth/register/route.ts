import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateSalt, hashPassword, createSessionToken, getSessionCookieOptions } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { User } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`register:${ip}`, { intervalMs: 60 * 1000, maxRequests: 5 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again in a minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }

    const body = await req.json();
    const { name, email, password } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name (at least 2 characters).' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = db.getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json({ error: 'An account with this email address already exists.' }, { status: 409 });
    }

    // Hash password
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      email: cleanEmail,
      name: name.trim(),
      role: 'USER',
      status: 'ACTIVE',
      passwordHash,
      salt,
      documentCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.createUser(newUser);

    // Create session token
    const token = createSessionToken(newUser);
    const cookieOpts = getSessionCookieOptions();

    // Log audit
    db.logAudit(newUser, 'USER_REGISTERED', 'USER', newUser.id, { email: cleanEmail });

    // Sanitize user object for client response
    const sanitized = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      status: newUser.status,
      documentCount: 0
    };

    const response = NextResponse.json({
      success: true,
      user: sanitized,
      redirect: '/app'
    }, { status: 201 });

    response.cookies.set({
      name: cookieOpts.name,
      value: token,
      httpOnly: cookieOpts.httpOnly,
      secure: cookieOpts.secure,
      sameSite: cookieOpts.sameSite,
      path: cookieOpts.path,
      maxAge: cookieOpts.maxAge
    });

    return response;
  } catch (err: any) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: err.message || 'Registration failed' }, { status: 500 });
  }
}
