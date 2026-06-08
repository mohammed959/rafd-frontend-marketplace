'use client';
import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK =
  process.env.NEXT_PUBLIC_DEFAULT_CATEGORY_IMAGE_URL ??
  'https://your-zone.b-cdn.net/category/default/default.png';

type Props = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
};

/**
 * Category image with Bunny-CDN-aware fallback.
 * Source URL is built on the backend from the category English slug
 * (`{categoryBase}/{slug}.png`); if the asset doesn't exist there, swap
 * to the default category image.
 */
export function CategoryImage({ src, alt, ...rest }: Props) {
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
