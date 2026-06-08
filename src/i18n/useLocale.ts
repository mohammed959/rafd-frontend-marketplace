'use client';
import { useLocale as useNextIntlLocale } from 'next-intl';
import type { Locale } from './config';

/** Strongly-typed wrapper around next-intl's useLocale. */
export function useLocale(): Locale {
  return useNextIntlLocale() as Locale;
}

/** Pick the right localized field for the current locale. */
export function pickLocalized<T extends { name?: string; nameAr?: string; title?: string; titleAr?: string }>(
  item: T | undefined | null,
  locale: Locale
): string {
  if (!item) return '';
  if (locale === 'ar') {
    return item.nameAr ?? item.titleAr ?? item.name ?? item.title ?? '';
  }
  return item.name ?? item.title ?? item.nameAr ?? item.titleAr ?? '';
}

export function useDisplayName(item: { name?: string; nameAr?: string } | undefined | null) {
  const locale = useLocale();
  return pickLocalized(item, locale);
}
