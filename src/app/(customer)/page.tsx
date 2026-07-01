'use client';
import useSWR from 'swr';
import api from '@/lib/api';
import { Category } from '@/types';
import { HomeCategoriesRow } from '@/components/customer/HomeCategoriesRow';
import { BannerCarousel } from '@/components/customer/BannerCarousel';
import { FeaturedStrip } from '@/components/customer/FeaturedStrip';
import { BuyAgainStrip } from '@/components/customer/BuyAgainStrip';
import { FeaturedSectionsList } from '@/components/customer/FeaturedSectionsList';
import { AllProductsStrip } from '@/components/customer/AllProductsStrip';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function HomePage() {
  const { data: categoriesData, isLoading: catsLoading } = useSWR<Category[]>(
    '/categories?home=true',
    fetcher
  );

  const categories = categoriesData ?? [];

  return (
    <div className="space-y-5">
      <BannerCarousel />

      {/* Categories — compact horizontal cards with "Discover more" */}
      {catsLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-[68px] shrink-0 rounded-2xl" />
          ))}
        </div>
      ) : (
        <HomeCategoriesRow categories={categories} />
      )}

      <BuyAgainStrip />
      <FeaturedStrip />
      <FeaturedSectionsList />

      <AllProductsStrip />
    </div>
  );
}
