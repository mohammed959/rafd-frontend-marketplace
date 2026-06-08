'use client';
import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';

const FALLBACK =
  process.env.NEXT_PUBLIC_DEFAULT_PRODUCT_IMAGE_URL ??
  'https://your-zone.b-cdn.net/defaults/basket.png';

type Props = Omit<ImageProps, 'src'> & {
  src: string | null | undefined;
};

/**
 * Product image with Bunny-CDN-aware fallback.
 * - Source URL is built on the backend from the product SKU (`{base}/{sku}.jpg`).
 * - If the asset doesn't exist there (image load fails), swap to the default
 *   basket image. Same for null/undefined srcs.
 */
export function ProductImage({ src, alt, ...rest }: Props) {
  const initial = src && src.trim() ? src : FALLBACK;
  const [current, setCurrent] = useState(initial);

  // If the upstream URL changes (e.g. variant switch), re-arm the image.
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
