import crypto from 'crypto';
import { cookies } from 'next/headers';
import { User, UserRole } from '@/types';
import { db } from '../db';

const SESSION_COOKIE_NAME = 'lexiguide_session';
const SESSION_SECRET = process.env.SESSION_SECRET || 'lexiguide-production-super-secret-key-2026-auth-protection';
const SESSION_MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

/**
 * Generates random cryptographic salt
 */
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Computes secure scrypt hash of a password with salt
 */
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

/**
 * Validates provided password against stored hash and salt
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(hash, 'hex'));
}

/**
 * Validates password complexity: min 8 chars, uppercase, lowercase, number, special char
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!password || password.length < 8) errors.push('Password must be at least 8 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
  if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
  if (!/[0-9]/.test(password)) errors.push('Password must contain at least one number');
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character');
  return { valid: errors.length === 0, errors };
}

/**
 * Creates signed session token: base64(payload).signature
 */
export function createSessionToken(user: { id: string; email: string; role: UserRole }): string {
  const payload = {
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
export function verifySessionToken(token: string): { userId: string; email: string; role: UserRole; expiresAt: number } | null {
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

    const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
    if (Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Reads session cookie and returns authenticated user from DB
 */
export async function getSessionUser(): Promise<User | null> {
  try {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie || !sessionCookie.value) return null;

    const payload = verifySessionToken(sessionCookie.value);
    if (!payload) return null;

    const user = db.getUserById(payload.userId);
    if (!user || user.status === 'SUSPENDED') return null;

    return user;
  } catch (err) {
    return null;
  }
}

/**
 * Cookie options helper
 */
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

/**
 * RBAC authorization validator
 */
export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  if (userRole === 'SUPER_ADMIN') return true;
  if (userRole === 'ADMIN') return requiredRole === 'ADMIN' || requiredRole === 'USER';
  return requiredRole === 'USER';
}

export const getCurrentUser = getSessionUser;
