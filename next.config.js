const createNextIntlPlugin = require('next-intl/plugin');

// Point next-intl to our request config (cookie-based locale, no routing).
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = withNextIntl(nextConfig);
