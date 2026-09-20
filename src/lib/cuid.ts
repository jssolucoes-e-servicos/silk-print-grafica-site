import { createId, isCuid } from '@paralleldrive/cuid2';

/**
 * Generates a collision-resistant, secure, cryptographically-sound CUID (cuid2 standard)
 */
export function createCuid(): string {
  return createId();
}

/**
 * Validates whether a string is a valid CUID
 */
export function isValidCuid(id: string): boolean {
  return isCuid(id);
}

export { createId, isCuid };
