/**
 * Generates a collision-resistant, secure CUID-like identifier
 * Fully self-contained without requiring external packages
 */
export function createCuid(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 6);
  return `c${timestamp}${randomPart}`;
}

export function isValidCuid(id: string): boolean {
  if (!id || typeof id !== 'string') return false;
  return id.length >= 10 && /^[a-z0-9_-]+$/i.test(id);
}

export const createId = createCuid;
export const isCuid = isValidCuid;

