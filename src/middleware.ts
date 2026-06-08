import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './i18n/config';

/**
 * Cookie-based locale middleware.
 * - If the locale cookie is missing or invalid, set it to the default (Arabic).
 * - Routes are not prefixed by locale; the server layout reads the cookie.
 */
export function middleware(req: NextRequest) {
  const current = req.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(current)) return NextResponse.next();

  const res = NextResponse.next();
  res.cookies.set(LOCALE_COOKIE, DEFAULT_LOCALE, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

export const config = {
  matcher: ['/((?!_next/|api/|favicon|.*\\..*).*)'],
};
