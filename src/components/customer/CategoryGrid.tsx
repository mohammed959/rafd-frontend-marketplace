'use client';
import Link from 'next/link';
import { CategoryImage } from '@/components/common/CategoryImage';
import { Category } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';

interface Props {
  categories: Category[];
  /** Truncate after N (e.g. 6) and show a "See all" tile. Pass 0 to render every category. */
  limit?: number;
}

/**
 * Ninja-style category grid: 3 columns on mobile, image-heavy, soft tinted
 * tile with the label beneath. Tap area is the whole tile.
 */
export function CategoryGrid({ categories, limit = 6 }: Props) {
  const locale = useLocale();
  const items = limit > 0 ? categories.slice(0, limit) : categories;
  const overflow = limit > 0 && categories.length > limit;

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((c) => {
        const name = pickLocalized(c, locale);
        return (
          <Link
            key={c.id}
            href={`/product-list/${c.id}`}
            className="group flex flex-col items-center gap-1.5"
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-brand-50 shadow-soft group-hover:shadow-card transition-shadow">
              <CategoryImage
                src={c.imageUrl}
                alt={name}
                fill
                sizes="(min-width: 640px) 160px, 33vw"
                className="object-cover transition-transform group-hover:scale-105"
              />
            </div>
            <p className="text-xs font-semibold text-gray-800 text-center leading-tight line-clamp-2 px-1">
              {name}
            </p>
          </Link>
        );
      })}

      {overflow && (
        <Link
          href="/categories"
          className="group flex flex-col items-center gap-1.5"
        >
          <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-brand-100 text-brand-700 text-2xl font-bold shadow-soft group-hover:bg-brand-200 transition-colors">
            +{categories.length - items.length}
          </div>
          <p className="text-xs font-semibold text-brand-700 text-center leading-tight px-1">
            ⋯
          </p>
        </Link>
      )}
    </div>
  );
}
