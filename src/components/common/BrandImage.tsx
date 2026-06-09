'use client';
import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK =
  process.env.NEXT_PUBLIC_DEFAULT_BRAND_IMAGE_URL ??
  'https://your-zone.b-cdn.net/brand/default/default.png';

type Props = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
};

/**
 * Brand logo with Bunny-CDN-aware fallback.
 * The backend builds the URL from the brand's English slug
 * (`{brandBase}/{slug}.png`); if the asset doesn't exist there, swap to
 * the default brand image so the layout never breaks.
 */
export function BrandImage({ src, alt, ...rest }: Props) {
  const initial = src && src.trim() ? src : FALLBACK;
  const [current, setCurrent] = useState(initial);

  useEffect(() => {
    setCurrent(src && src.trim() ? src : FALLBACK);
  }, [src]);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      onError={() => {
        if (current !== FALLBACK) setCurrent(FALLBACK);
      }}
    />
  );
}
