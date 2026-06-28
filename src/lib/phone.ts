/**
 * Saudi mobile phone helpers — single source of truth for validating and
 * normalizing the local number a customer types into the login screens.
 *
 * The UI always shows a fixed `+966` prefix; the customer only enters the
 * local part. Two accepted local formats:
 *   - starts with 0 → exactly 10 digits (e.g. 0512345678)
 *   - starts with 5 → exactly  9 digits (e.g. 512345678)
 * Both normalize to the same E.164 form: +966512345678.
 */

export const SAUDI_DIAL_CODE = '+966';
/** Max local digits we ever accept (the "0" form). */
export const SAUDI_LOCAL_MAX = 10;

export type SaudiPhoneError = null | 'invalid' | 'len10' | 'len9';

/** Strip everything that isn't a digit. */
export function sanitizeDigits(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Validate the local (post-+966) number. Returns `null` when valid, or an
 * error key the UI maps to a localized message.
 */
export function validateSaudiLocal(localRaw: string): SaudiPhoneError {
  const d = sanitizeDigits(localRaw);
  if (!d) return 'invalid';
  if (d.startsWith('0')) return d.length === 10 ? null : 'len10';
  if (d.startsWith('5')) return d.length === 9 ? null : 'len9';
  return 'invalid';
}

export function isValidSaudiLocal(localRaw: string): boolean {
  return validateSaudiLocal(localRaw) === null;
}

/**
 * Normalize a valid local number to the E.164 format the backend stores.
 * Assumes the input has already passed validation; a leading 0 is dropped
 * so both `0512345678` and `512345678` produce `+966512345678`.
 */
export function normalizeSaudiPhone(localRaw: string): string {
  const d = sanitizeDigits(localRaw);
  const local = d.startsWith('0') ? d.slice(1) : d;
  return `${SAUDI_DIAL_CODE}${local}`;
}
