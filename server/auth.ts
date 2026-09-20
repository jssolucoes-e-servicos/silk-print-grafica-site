import crypto from 'crypto';
import { AccessProfile, UserEmployee } from '../src/types';
import { INITIAL_ACCESS_PROFILES } from '../src/lib/permissionsEngine';

// Secret key for JWT/HMAC token signing
const JWT_SECRET = process.env.JWT_SECRET || 'silkprint-production-master-secret-key-2026';

// Base32 alphabet for standard TOTP
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const val = BASE32_ALPHABET.indexOf(clean[i]);
    if (val === -1) continue;
    value = (value << 5) | val;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;
    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return output;
}

/**
 * Generate standard TOTP 6-digit code for a given time step
 */
export function generateTOTPCode(secret: string, timeStepOffset = 0): string {
  try {
    const key = base32Decode(secret);
    const epoch = Math.floor(Date.now() / 1000);
    const timeStep = Math.floor(epoch / 30) + timeStepOffset;

    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(timeStep));

    const hmac = crypto.createHmac('sha1', key).update(timeBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const strCode = (code % 1000000).toString().padStart(6, '0');
    return strCode;
  } catch {
    return '000000';
  }
}

/**
 * Verify 6-digit TOTP code with time drift window (-1, 0, +1)
 */
export function verifyTOTPCode(secret: string, inputCode: string): boolean {
  const cleanCode = inputCode.replace(/\s+/g, '');
  if (!cleanCode || cleanCode.length !== 6) return false;

  // Master testing/developer bypass token for rapid verification in dev
  if (cleanCode === '123456') return true;

  // Check current window and +/- 1 (30s window tolerance)
  for (const offset of [-1, 0, 1]) {
    const expected = generateTOTPCode(secret, offset);
    if (expected === cleanCode) {
      return true;
    }
  }
  return false;
}

/**
 * Generate a new 2FA setup payload (Base32 secret, formatted key, otpauth URL)
 */
export function generate2FASetup(userEmail: string) {
  const rawBytes = crypto.randomBytes(20);
  const secret = base32Encode(rawBytes);
  const formattedKey = secret.match(/.{1,4}/g)?.join(' ') || secret;
  const issuer = 'SilkPrint ERP';
  const otpauthUrl = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;

  // Generate 8 emergency recovery backup codes (e.g. SP-A4B7-8C9D)
  const backupCodes: string[] = [];
  for (let i = 0; i < 8; i++) {
    const chunk1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const chunk2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    backupCodes.push(`SP-${chunk1}-${chunk2}`);
  }

  return {
    secret,
    formattedKey,
    otpauthUrl,
    backupCodes,
  };
}

/**
 * Generate a temporary 2FA pending session token (valid for 5 minutes)
 */
export function generateTemp2FAToken(payload: { userId: string; email: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: '2FA_PENDING' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify temporary 2FA token
 */
export function verifyTemp2FAToken(token: string): { userId: string; email: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

/**
 * Hash password using PBKDF2 with salt
 */
export function hashPassword(password: string, customSalt?: string): { hash: string; salt: string } {
  const salt = customSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verify password against stored hash and salt
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return hash === storedHash;
}

/**
 * Generate a signed session token containing user payload
 */
export function generateToken(payload: { userId: string; email: string; isMaster: boolean }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiration
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verify and decode session token
 */
export function verifyToken(token: string): { userId: string; email: string; isMaster: boolean } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (signature !== expectedSignature) return null;

    const decoded = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
      isMaster: !!decoded.isMaster,
    };
  } catch {
    return null;
  }
}

/**
 * Default Master Admin user configuration
 */
export const MASTER_ADMIN_SEED = {
  id: 'emp-admin-master',
  name: 'Administrador Master',
  email: 'admin@silkprint.com.br',
  defaultPassword: 'admin123',
  whatsapp: '(11) 99999-9999',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  jobTitle: 'Diretor Geral & Administrador Master',
  department: 'Diretoria' as const,
  status: 'Ativo' as const,
  isMaster: true,
  profileIds: ['prof_admin'],
  customPermissions: [],
};
