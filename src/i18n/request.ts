import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale } from './config';
import { loadMessages } from './getMessages';

export default getRequestConfig(async () => {
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const messages = await loadMessages(locale);

  return { locale, messages };
});
