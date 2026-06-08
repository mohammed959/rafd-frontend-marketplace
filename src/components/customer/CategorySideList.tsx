'use client';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { cn } from '@/lib/utils';

interface CategorySideListProps {
  categories: Category[];
  activeCategoryId: string;
  activeSubcategoryId?: string | null;
  /** Called after a subcategory link is tapped (e.g. close a mobile drawer). */
  onNavigate?: () => void;
}

/**
 * Vertical list of categories. The active category is expanded inline
 * to reveal its subcategories. Uses logical CSS properties so the list
 * stays on the leading edge in both LTR and RTL layouts.
 */
export function CategorySideList({
  categories,
  activeCategoryId,
  activeSubcategoryId,
  onNavigate,
}: CategorySideListProps) {
  const t = useTranslations('categories');
  const locale = useLocale();

  return (
    <ul className="flex flex-col gap-1 text-sm">
      <li>
        <Link
          href="/categories"
          onClick={onNavigate}
          className="block rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 hover:bg-gray-100"
        >
          {t('allCategories')}
        </Link>
      </li>

      {categories.map((cat) => {
        const isActive = cat.id === activeCategoryId;
        const catName = pickLocalized(cat, locale);
        return (
          <li key={cat.id}>
            <Link
              href={`/product-list/${cat.id}`}
              onClick={onNavigate}
              className={cn(
                'flex items-center justify-between rounded-xl px-3 py-2.5 font-semibold transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-700 hover:bg-gray-100'
              )}
            >
              <span className="truncate">{catName}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform',
                  isActive ? 'rotate-180 text-brand-500' : 'text-gray-400'
                )}
              />
            </Link>

            {isActive && cat.subcategories.length > 0 && (
              <ul className="mt-1 ms-3 flex flex-col gap-0.5 border-s border-gray-100 ps-3">
                <li>
                  <Link
                    href={`/product-list/${cat.id}`}
                    onClick={onNavigate}
                    className={cn(
                      'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                      !activeSubcategoryId
                        ? 'bg-brand-100/60 text-brand-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {catName}
                  </Link>
                </li>
                {cat.subcategories.map((sub) => {
                  const subActive = sub.id === activeSubcategoryId;
                  return (
                    <li key={sub.id}>
                      <Link
                        href={`/product-list/${cat.id}?sub=${sub.id}`}
                        onClick={onNavigate}
                        className={cn(
                          'block rounded-lg px-3 py-1.5 text-sm transition-colors',
                          subActive
                            ? 'bg-brand-100/60 text-brand-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-100'
                        )}
                      >
                        {pickLocalized(sub, locale)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
