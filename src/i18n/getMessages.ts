import 'server-only';
import { cookies } from 'next/headers';
import type { Locale } from './config';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './config';

export function readLocale(): Locale {
  const cookie = cookies().get(LOCALE_COOKIE)?.value;
  return isLocale(cookie) ? cookie : DEFAULT_LOCALE;
}

export async function loadMessages(locale: Locale) {
  // Static imports keep them in the bundle; dynamic per-locale only loads
  // the active language at request time.
  if (locale === 'en') return (await import('../messages/en.json')).default;
  return (await import('../messages/ar.json')).default;
}
