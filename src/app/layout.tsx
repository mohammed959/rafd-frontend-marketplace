import type { Metadata } from 'next';
import { Inter, Tajawal } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { Toaster } from 'react-hot-toast';
import { readLocale, loadMessages } from '@/i18n/getMessages';
import { LOCALE_DIR } from '@/i18n/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Al-Hathlul Supermarket',
  description: 'Fast grocery delivery',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = readLocale();
  const messages = await loadMessages(locale);
  const dir = LOCALE_DIR[locale];

  return (
    <html lang={locale} dir={dir} className={`${inter.variable} ${tajawal.variable}`}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '10px', fontSize: '14px' },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
