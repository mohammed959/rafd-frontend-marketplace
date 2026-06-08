'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { cn } from '@/lib/utils';

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId?: string | null;
}

export function CategoryBar({ categories, activeCategoryId }: CategoryBarProps) {
  const t = useTranslations('categories');
  const locale = useLocale();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <Link
        href="/categories"
        className={cn(
          'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
          !activeCategoryId
            ? 'bg-brand-500 text-white shadow-sm'
            : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
        )}
      >
        {t('allCategories')}
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`/product-list/${cat.id}`}
          className={cn(
            'shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
            activeCategoryId === cat.id
              ? 'bg-brand-500 text-white shadow-sm'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
          )}
        >
          {pickLocalized(cat, locale)}
        </Link>
      ))}
    </div>
  );
}
