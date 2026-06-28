'use client';
import useSWR from 'swr';
import api from '@/lib/api';
import { FeaturedSection } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function FeaturedSectionsList() {
  const locale = useLocale();
  const { data, isLoading } = useSWR<FeaturedSection[]>('/featured-sections', fetcher);

  if (isLoading) {
    return (
      <section className="space-y-3">
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="w-[28%] sm:w-[30%] md:w-[23%] lg:w-[18%] shrink-0 snap-start"><ProductCardSkeleton /></div>
          ))}
        </div>
      </section>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <>
      {data.map((section) => (
        <section key={section.id} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-gray-900">{pickLocalized(section, locale)}</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
            {section.items.map((item) => (
              <div key={item.id} className="w-[28%] sm:w-[30%] md:w-[23%] lg:w-[18%] shrink-0 snap-start">
                <ProductCard product={item.product} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
