import { describe, it, expect } from 'vitest';
import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  createSessionToken,
  verifySessionToken,
  hasPermission
} from '../../lib/auth';

describe('Cryptographic Authentication & RBAC Engine', () => {
  it('correctly hashes and verifies passwords using scrypt with unique salt', () => {
    const password = 'SecurePassword2026!';
    const salt = 'a1b2c3d4e5f678901234567890abcdef';
    const hash = hashPassword(password, salt);

    expect(hash).toBeTruthy();
    expect(hash.length).toBeGreaterThan(32);

    // Matching password verifies successfully
    const isValid = verifyPassword(password, hash, salt);
    expect(isValid).toBe(true);

    // Incorrect password fails verification
    const isInvalid = verifyPassword('WrongPassword123!', hash, salt);
    expect(isInvalid).toBe(false);
  });

  it('enforces strong password validation rules', () => {
    // Valid password
    expect(validatePasswordStrength('LegalPass123!').valid).toBe(true);

    // Too short
    expect(validatePasswordStrength('Sh1!').valid).toBe(false);

    // Missing number
    expect(validatePasswordStrength('LegalPassword!').valid).toBe(false);

    // Missing special character
    expect(validatePasswordStrength('LegalPassword123').valid).toBe(false);

    // Missing uppercase
    expect(validatePasswordStrength('legalpassword123!').valid).toBe(false);
  });

  it('creates and verifies cryptographically signed session tokens', () => {
    const mockUser = {
      id: 'usr-test-123',
      email: 'alex@example.com',
      name: 'Alex Morgan',
      role: 'USER' as const,
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const token = createSessionToken(mockUser);
    expect(token).toBeTruthy();
    expect(token.split('.')).toHaveLength(2);

    const verified = verifySessionToken(token);
    expect(verified).not.toBeNull();
    expect(verified?.userId).toBe(mockUser.id);
    expect(verified?.email).toBe(mockUser.email);
    expect(verified?.role).toBe('USER');

    // Tampered token fails verification
    const tamperedToken = token.slice(0, -5) + 'abcde';
    expect(verifySessionToken(tamperedToken)).toBeNull();
  });

  it('strictly enforces role-based access control (RBAC)', () => {
    // USER cannot access ADMIN
    expect(hasPermission('USER', 'ADMIN')).toBe(false);
    expect(hasPermission('USER', 'SUPER_ADMIN')).toBe(false);
    expect(hasPermission('USER', 'USER')).toBe(true);

    // ADMIN can access ADMIN and USER, but not SUPER_ADMIN
    expect(hasPermission('ADMIN', 'USER')).toBe(true);
    expect(hasPermission('ADMIN', 'ADMIN')).toBe(true);
    expect(hasPermission('ADMIN', 'SUPER_ADMIN')).toBe(false);

    // SUPER_ADMIN can access all
    expect(hasPermission('SUPER_ADMIN', 'USER')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'ADMIN')).toBe(true);
    expect(hasPermission('SUPER_ADMIN', 'SUPER_ADMIN')).toBe(true);
  });
});
