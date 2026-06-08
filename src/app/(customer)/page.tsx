'use client';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Category } from '@/types';
import { ProductCard } from '@/components/customer/ProductCard';
import { CategoryGrid } from '@/components/customer/CategoryGrid';
import { BannerCarousel } from '@/components/customer/BannerCarousel';
import { FeaturedStrip } from '@/components/customer/FeaturedStrip';
import { BuyAgainStrip } from '@/components/customer/BuyAgainStrip';
import { FeaturedSectionsList } from '@/components/customer/FeaturedSectionsList';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useInfiniteProducts } from '@/hooks/useInfiniteProducts';
import { LoadMoreSentinel } from '@/components/common/LoadMoreSentinel';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

const PAGE_SIZE = 20;

export default function HomePage() {
  const t = useTranslations();

  const { data: categoriesData, isLoading: catsLoading } = useSWR<Category[]>(
    '/categories',
    fetcher
  );

  const {
    items: products,
    isLoading,
    isLoadingMore,
    hasMore,
    totalItems,
    loadMore,
  } = useInfiniteProducts({
    pageSize: PAGE_SIZE,
    buildUrl: (page) =>
      `/products?page=${page}&pageSize=${PAGE_SIZE}&excludeHiddenFromHome=true`,
  });

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

      <section className="space-y-3">
        <h2 className="text-base font-bold text-gray-900">{t('products.allProducts')}</h2>

        {isLoading ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <EmptyState title={t('products.noProducts')} description={t('products.comeBackLater')} />
        ) : (
          <>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <LoadMoreSentinel
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
              totalShown={products.length}
              totalItems={totalItems}
            />
          </>
        )}
      </section>
    </div>
  );
}
