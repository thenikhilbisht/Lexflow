import crypto from 'crypto';
import { UserRole } from '@/types';

const SESSION_COOKIE_NAME = 'lexiguide_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'lexiguide-production-super-secret-key-2026-auth-protection';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export interface SessionTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: number;
}

/**
 * Creates signed session token: base64(payload).signature
 */
export function createSessionToken(user: { id: string; email: string; role: UserRole }): string {
  const payload: SessionTokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + SESSION_MAX_AGE_SEC * 1000
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadStr)
    .digest('base64url');

  return `${payloadStr}.${signature}`;
}

/**
 * Verifies signed session token and returns decoded payload
 */
export function verifySessionToken(token: string): SessionTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadStr, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(payloadStr)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: SessionTokenPayload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: SESSION_COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC
  };
}
