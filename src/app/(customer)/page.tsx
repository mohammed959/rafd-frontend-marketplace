'use client';
import useSWR from 'swr';
import api from '@/lib/api';
import { Category } from '@/types';
import { CategoryGrid } from '@/components/customer/CategoryGrid';
import { BannerCarousel } from '@/components/customer/BannerCarousel';
import { FeaturedStrip } from '@/components/customer/FeaturedStrip';
import { BuyAgainStrip } from '@/components/customer/BuyAgainStrip';
import { FeaturedSectionsList } from '@/components/customer/FeaturedSectionsList';
import { AllProductsStrip } from '@/components/customer/AllProductsStrip';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function HomePage() {
  const { data: categoriesData, isLoading: catsLoading } = useSWR<Category[]>(
    '/categories',
    fetcher
  );

  const categories = categoriesData ?? [];

  return (
    <div className="space-y-5">
      <BannerCarousel />

      {/* Categories — 3-column grid (Ninja-style) */}
      {catsLoading ? (
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : (
        categories.length > 0 && <CategoryGrid categories={categories} limit={6} />
      )}

      <BuyAgainStrip />
      <FeaturedStrip />
      <FeaturedSectionsList />

      <AllProductsStrip />
    </div>
  );
}
