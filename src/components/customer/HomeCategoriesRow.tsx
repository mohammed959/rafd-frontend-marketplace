'use client';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CategoryImage } from '@/components/common/CategoryImage';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';

/**
 * Home categories: compact, horizontally-scrollable cards with a "Discover
 * more" link to the full /categories page. Receives only the categories the
 * backend flagged for home (active + showOnHome).
 */
export function HomeCategoriesRow({ categories }: { categories: Category[] }) {
  const t = useTranslations();
  const locale = useLocale();

  if (categories.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">{t('categories.title')}</h2>
        <Link
          href="/categories"
          className="inline-flex items-center gap-0.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {t('categories.discoverMore')}
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map((c) => {
          const name = pickLocalized(c, locale);
          return (
            <Link
              key={c.id}
              href={`/product-list/${c.id}`}
              className="group flex w-[68px] shrink-0 flex-col items-center gap-1.5"
            >
              <div className="relative h-[68px] w-[68px] overflow-hidden rounded-2xl bg-brand-50 shadow-soft transition-shadow group-hover:shadow-card">
                <CategoryImage
                  src={c.imageUrl}
                  alt={name}
                  fill
                  sizes="68px"
                  className="object-cover transition-transform group-hover:scale-105"
                />
              </div>
              <p className="w-full text-center text-[11px] font-medium leading-tight text-gray-700 line-clamp-2">
                {name}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
