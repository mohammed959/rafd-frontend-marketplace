'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { CategoryImage } from '@/components/common/CategoryImage';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function CategoriesPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading } = useSWR<Category[]>('/categories', fetcher);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">{t('categories.allCategories')}</h1>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title={t('categories.noCategories')} />
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {data.map((c) => {
            const name = pickLocalized(c, locale);
            return (
              <Link
                key={c.id}
                href={`/product-list/${c.id}`}
                className="group flex flex-col items-center gap-2 rounded-2xl bg-white border border-gray-100 p-3 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-brand-50">
                  <CategoryImage
                    src={c.imageUrl}
                    alt={name}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <p className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2">
                  {name}
                </p>
                {c.subcategories.length > 0 && (
                  <p className="text-[10px] text-gray-400">
                    {t('categories.subcategoriesLabel', { count: c.subcategories.length })}
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
