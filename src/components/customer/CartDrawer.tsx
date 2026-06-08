'use client';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { useLocale } from '@/i18n/useLocale';
import { formatPrice, variantLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const t = useTranslations();
  const locale = useLocale();
  const {
    items, isOpen, closeCart, updateQuantity, removeItem,
    subtotal, deliveryFee,
  } = useCartStore();
  const sub = subtotal();
  const threshold = 100;
  const remaining = Math.max(0, threshold - sub);

  // `end-0` already mirrors position; mirror the slide direction too.
  const fromX = locale === 'ar' ? '-100%' : '100%';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-drawer bg-black/40 backdrop-blur-sm"
            onClick={closeCart}
          />

          <motion.div
            key="cart-panel"
            initial={{ x: fromX }}
            animate={{ x: 0 }}
            exit={{ x: fromX }}
            transition={{ type: 'spring', stiffness: 340, damping: 36 }}
            className="fixed inset-y-0 end-0 z-drawer flex w-full max-w-sm flex-col bg-white shadow-sheet"
          >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-brand-500" />
            <span className="font-bold text-gray-900">{t('cart.yourCart')}</span>
            {items.length > 0 && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {items.reduce((s, i) => s + i.quantity, 0)} {t('cart.items')}
              </span>
            )}
          </div>
          <button onClick={closeCart} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <ShoppingBag className="h-8 w-8 text-gray-300" />
              </div>
              <p className="font-semibold text-gray-500">{t('cart.empty')}</p>
              <button onClick={closeCart} className="text-sm text-brand-500 font-medium underline">
                {t('products.continueShopping')}
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-3 rounded-xl border border-gray-100 bg-white p-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <ProductImage src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                  </div>

                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                    <p className="text-xs text-gray-500">{variantLabel(item.variantType)}</p>
                    <p className="text-sm font-bold text-brand-600">{formatPrice(item.price)}</p>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <button onClick={() => removeItem(item.variantId)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={t('cart.remove')}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        aria-label="-"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 hover:bg-brand-600 transition-colors"
                        aria-label="+"
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t bg-white px-4 py-4 space-y-3">
            {remaining > 0 ? (
              <div className="rounded-xl bg-brand-50 p-3">
                <div className="mb-1.5 flex justify-between text-xs font-medium text-brand-700">
                  <span>{t('cart.freeDeliveryProgress', { amount: formatPrice(remaining) })}</span>
                  <span>{formatPrice(sub)} / {formatPrice(threshold)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-brand-200">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{ width: `${Math.min(100, (sub / threshold) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
                <span>✓</span>
                <span>{t('delivery.thresholdApplied')}</span>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span>{formatPrice(sub)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>{t('cart.delivery')}</span>
                <span className={remaining === 0 ? 'text-green-600 font-semibold' : ''}>
                  {remaining === 0 ? t('common.free') : formatPrice(deliveryFee)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                <span>{t('cart.total')}</span>
                <span className="text-brand-600">{formatPrice(remaining === 0 ? sub : sub + Number(deliveryFee))}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart}>
              <Button className="w-full" size="lg">
                {t('cart.checkout')}
              </Button>
            </Link>
          </div>
        )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
