'use client';
import { ProductVariant } from '@/types';
import { useLocale } from '@/i18n/useLocale';
import { variantLabelLocalized, formatPrice, cn } from '@/lib/utils';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variant: ProductVariant) => void;
  showPrice?: boolean;
  size?: 'sm' | 'md';
}

export function VariantSelector({
  variants,
  selectedId,
  onSelect,
  showPrice = false,
  size = 'sm',
}: VariantSelectorProps) {
  const locale = useLocale();
  if (variants.length <= 1) return null;

  return (
    <div className={cn('flex flex-wrap gap-2', size === 'md' && 'gap-2.5')}>
      {variants.map((v) => {
        const isSelected = v.id === selectedId;
        const available = v.available ?? v.stock - v.reserved > 0;
        return (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelect(v)}
            disabled={!available}
            className={cn(
              'rounded-xl border transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-2 text-sm',
              isSelected
                ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold'
                : 'border-gray-200 text-gray-700 hover:border-brand-300',
              !available && 'opacity-50 cursor-not-allowed line-through'
            )}
          >
            <span>{variantLabelLocalized(v.type, locale)}</span>
            {showPrice && (
              <span className="ml-1.5 font-bold text-brand-600">{formatPrice(v.price)}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
