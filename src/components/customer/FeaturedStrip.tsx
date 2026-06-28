'use client';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export function FeaturedStrip() {
  const t = useTranslations('products');
  const { data, isLoading } = useSWR<Product[]>('/products/featured', fetcher);

  if (!isLoading && (!data || data.length === 0)) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">{t('featuredForYou')}</h2>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[28%] sm:w-[30%] md:w-[23%] lg:w-[18%] shrink-0 snap-start">
                <ProductCardSkeleton />
              </div>
            ))
          : data!.map((product) => (
              <div key={product.id} className="w-[28%] sm:w-[30%] md:w-[23%] lg:w-[18%] shrink-0 snap-start">
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
}
