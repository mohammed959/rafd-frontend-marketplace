'use client';
import Link from 'next/link';
import { ProductImage } from '@/components/common/ProductImage';
import { useTranslations } from 'next-intl';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useLocale } from '@/i18n/useLocale';
import { formatPrice, variantLabelLocalized } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';

export default function CartPage() {
  const t = useTranslations();
  const locale = useLocale();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const deliveryFee = useCartStore((s) => s.deliveryFee);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const threshold = 100;
  const remaining = Math.max(0, threshold - subtotal);
  const total = subtotal + Number(deliveryFee);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-brand-400" />
        <p className="font-semibold text-gray-700">{t('cart.empty')}</p>
        <Link href="/">
          <Button>{t('cart.startShopping')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-28">
      <h1 className="text-lg font-bold text-gray-900">{t('cart.yourCart')}</h1>

      {/* Free-delivery progress */}
      {remaining > 0 ? (
        <Card tone="default" shadow="soft" pad="md">
          <div className="mb-1.5 flex justify-between text-xs font-semibold text-brand-700">
            <span>{t('cart.freeDeliveryProgress', { amount: formatPrice(remaining) })}</span>
            <span className="text-gray-500">{formatPrice(subtotal)} / {formatPrice(threshold)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-brand-100">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out-soft"
              style={{ width: `${Math.min(100, (subtotal / threshold) * 100)}%` }}
            />
          </div>
        </Card>
      ) : (
        <Card tone="default" shadow="soft" pad="md" className="flex items-center gap-2 text-sm font-semibold text-success-700">
          <span>✓</span>{t('delivery.thresholdApplied')}
        </Card>
      )}

      {/* Items */}
      <Card tone="default" shadow="soft" pad="none">
        <ul className="divide-y divide-gray-100">
          {items.map((item) => (
            <li key={item.variantId} className="flex gap-3 p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
                <ProductImage src={item.productImage} alt={item.productName} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex flex-1 flex-col gap-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500">{variantLabelLocalized(item.variantType, locale)}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="font-bold text-brand-600">{formatPrice(Number(item.price) * item.quantity)}</p>
                  <QuantityStepper
                    size="sm"
                    value={item.quantity}
                    onChange={(q) => updateQuantity(item.variantId, q)}
                  />
                </div>
              </div>
              <button
                onClick={() => removeItem(item.variantId)}
                aria-label={t('cart.remove')}
                className="self-start rounded-full p-1.5 text-gray-400 hover:bg-danger-50 hover:text-danger-500 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {/* Summary */}
      <Card tone="default" shadow="soft" pad="md" className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>{t('cart.subtotal')}</span><span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t('cart.delivery')}</span>
          <span className={remaining === 0 ? 'text-success-600 font-semibold' : ''}>
            {remaining === 0 ? t('common.free') : formatPrice(deliveryFee)}
          </span>
        </div>
        <div className="flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
          <span>{t('cart.total')}</span>
          <span className="text-brand-600">{formatPrice(remaining === 0 ? subtotal : total)}</span>
        </div>
      </Card>

      {/* Desktop / inline checkout CTA */}
      <div className="hidden md:block">
        <Link href="/checkout">
          <Button className="w-full" size="lg">
            {t('cart.checkout')} · {formatPrice(remaining === 0 ? subtotal : total)}
          </Button>
        </Link>
      </div>

      {/* Mobile sticky checkout footer */}
      <div className="md:hidden fixed inset-x-0 bottom-16 z-sticky px-4 pb-3 pointer-events-none">
        <Link
          href="/checkout"
          className="
            pointer-events-auto flex w-full items-center justify-between
            rounded-3xl bg-brand-500 px-5 py-3.5 text-white shadow-pop
            hover:bg-brand-600 transition-colors
          "
        >
          <div className="text-start">
            <p className="text-xs opacity-80 leading-tight">{items.length} {items.length === 1 ? t('cart.item') : t('cart.items')}</p>
            <p className="text-lg font-bold leading-tight">{formatPrice(remaining === 0 ? subtotal : total)}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-3 py-1.5 text-sm font-bold">
            {t('cart.checkout')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </span>
        </Link>
      </div>
    </div>
  );
}
