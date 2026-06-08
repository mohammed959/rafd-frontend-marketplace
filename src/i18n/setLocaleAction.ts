'use server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { LOCALE_COOKIE, isLocale } from './config';

export async function setLocaleAction(locale: string) {
  if (!isLocale(locale)) return;
  cookies().set(LOCALE_COOKIE, locale, {
    path: '/',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}
