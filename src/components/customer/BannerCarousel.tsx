'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Banner } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { BannerSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

function resolveBannerLink(b: Banner): string | null {
  if (!b.linkType || !b.linkValue) return null;
  switch (b.linkType) {
    case 'category':    return `/product-list/${b.linkValue}`;
    case 'subcategory': return `/product-list/${b.linkValue.split(':')[0]}?sub=${b.linkValue.split(':')[1] ?? ''}`;
    case 'product':     return `/product-details/${b.linkValue}`;
    case 'url':         return b.linkValue;
    default:            return null;
  }
}

export function BannerCarousel() {
  const router = useRouter();
  const locale = useLocale();
  const { data, isLoading } = useSWR<Banner[]>('/banners', fetcher);
  const [index, setIndex] = useState(0);

  const banners = data ?? [];

  // Auto-rotate every 5s
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (isLoading) return <BannerSkeleton />;
  if (banners.length === 0) return null;

  const active = banners[index];
  const link = resolveBannerLink(active);

  return (
    <div className="space-y-2">
      <button
        onClick={() => link && router.push(link)}
        disabled={!link}
        className="block w-full overflow-hidden rounded-2xl bg-brand-50 shadow-soft transition-transform active:scale-[0.99]"
      >
        {/* Aspect kept consistent so the layout never jumps; object-contain
            keeps the whole image visible (no cropping) regardless of the
            uploaded aspect ratio. */}
        <div className="relative aspect-[16/7] w-full">
          <Image
            src={active.imageUrl}
            alt={pickLocalized(active, locale)}
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            className="object-contain"
            priority
          />
        </div>
      </button>

      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-6 bg-brand-500' : 'w-1.5 bg-gray-300'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
