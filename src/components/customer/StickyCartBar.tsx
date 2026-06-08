'use client';
import { ShoppingCart, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { formatPrice } from '@/lib/utils';

export function StickyCartBar() {
  const t = useTranslations('cart');
  const router = useRouter();
  const pathname = usePathname();
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());

  // Don't double-render the floating pill on /cart or /checkout — those
  // pages already render their own primary action footer.
  const hide =
    pathname.startsWith('/cart') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/product-details');
  if (hide) return null;

  const goToCart = () => router.push('/cart');

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="sticky-cart"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="md:hidden fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.25rem)] z-sticky pointer-events-none"
        >
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={goToCart}
            className="pointer-events-auto flex w-full items-center gap-2.5 rounded-full bg-brand-500 ps-2 pe-4 py-2 text-white shadow-pop hover:bg-brand-600 transition-colors"
          >
            <span className="flex items-center gap-1.5 rounded-full bg-white/15 ps-2 pe-3 py-1.5">
              <ShoppingCart className="h-4 w-4 text-white" />
              <span className="text-sm font-bold leading-none tabular-nums">{itemCount}</span>
            </span>

            <span className="flex-1 text-start text-sm font-bold leading-tight truncate tabular-nums">
              {formatPrice(subtotal)}
            </span>

            <span className="flex items-center gap-1 text-sm font-bold">
              {t('viewCart')}
              <ChevronRight className="h-4 w-4 rtl:rotate-180" />
            </span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
