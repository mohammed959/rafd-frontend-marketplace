'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface Props {
  categories: Category[];
  activeCategoryId: string;
  activeSubcategoryId: string | null;
  onSubChange: (subId: string | null) => void;
}

export function CategoryNav({
  categories,
  activeCategoryId,
  activeSubcategoryId,
  onSubChange,
}: Props) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();

  const mainRef = useRef<HTMLDivElement | null>(null);
  const subRef = useRef<HTMLDivElement | null>(null);

  const activeCategory = categories.find((c) => c.id === activeCategoryId) ?? null;
  const subs = activeCategory?.subcategories ?? [];

  // Auto-scroll active tab/chip into view when category or subcategory changes
  useEffect(() => {
    const el = mainRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeCategoryId]);

  useEffect(() => {
    const el = subRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeSubcategoryId, activeCategoryId]);

  const handleCategoryClick = (id: string) => {
    if (id === activeCategoryId) return;
    router.push(`/product-list/${id}`);
  };

  return (
    <div className="sticky top-[120px] z-sticky -mx-4 border-b border-gray-100 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/80 md:top-[124px]">
      {/* Main category underline tabs */}
      <div
        ref={mainRef}
        className="flex gap-1 overflow-x-auto scrollbar-hide px-4"
      >
        {categories.map((c) => {
          const active = c.id === activeCategoryId;
          const name = pickLocalized(c, locale);
          return (
            <button
              key={c.id}
              data-active={active}
              type="button"
              onClick={() => handleCategoryClick(c.id)}
              className={cn(
                'relative shrink-0 whitespace-nowrap px-3 py-3 text-sm font-semibold transition-colors',
                active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
              )}
            >
              {name}
              <span
                className={cn(
                  'absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-all',
                  active ? 'bg-brand-500 opacity-100' : 'bg-transparent opacity-0'
                )}
              />
            </button>
          );
        })}
      </div>

      {/* Subcategory chips */}
      {subs.length > 0 && (
        <div
          ref={subRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide px-4 py-2"
        >
          <button
            type="button"
            data-active={!activeSubcategoryId}
            onClick={() => onSubChange(null)}
            className={cn(
              'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
              !activeSubcategoryId
                ? 'bg-brand-500 text-white shadow-soft'
                : 'border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600'
            )}
          >
            {t('categories.allCategories')}
          </button>
          {subs.map((s) => {
            const active = s.id === activeSubcategoryId;
            return (
              <button
                key={s.id}
                type="button"
                data-active={active}
                onClick={() => onSubChange(s.id)}
                className={cn(
                  'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
                  active
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'border border-gray-200 bg-white text-gray-700 hover:border-brand-300 hover:text-brand-600'
                )}
              >
                {pickLocalized(s, locale)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
