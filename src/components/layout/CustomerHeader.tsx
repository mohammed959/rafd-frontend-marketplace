'use client';
import { ShoppingCart, Search, MapPin, Bell, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/stores/cartStore';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { useLocationStore } from '@/stores/locationStore';
import { useNotificationsStore } from '@/stores/notificationsStore';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

/**
 * Mobile-first header inspired by Ninja:
 *  Row 1: logo + deliver-to chip + actions (language, bell, cart).
 *  Row 2: full-width rounded search bar.
 */
export function CustomerHeader() {
  const t = useTranslations();
  const count = useCartStore((s) => s.itemCount());
  const openCart = useCartStore((s) => s.openCart);
  const isAuthenticated = useCustomerAuthStore((s) => s.isAuthenticated);
  const storedLabel = useLocationStore((s) => s.label);
  const unread = useNotificationsStore((s) => s.unreadCount);

  const locationLabel = storedLabel === 'Choose location' ? t('nav.location') : storedLabel;

  return (
    <header className="sticky top-0 z-nav bg-gray-50 px-4 pt-4 pb-3 space-y-3">
      <div className="flex items-center gap-2">
        {/* Logo — always visible */}
        <Link href="/" className="flex items-center shrink-0" aria-label="Mirad">
          <BrandLogo size="sm" priority />
        </Link>

        {/* Deliver-to chip */}
        <Link
          href="/checkout/location"
          className="flex flex-1 items-center gap-2 min-w-0 rounded-2xl bg-white px-3 py-2 shadow-soft active:scale-[0.98] transition-transform"
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-50">
            <MapPin className="h-3.5 w-3.5 text-brand-600" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 leading-none">{t('nav.deliverTo')}</p>
            <p className="text-sm font-bold text-gray-900 truncate leading-tight">{locationLabel}</p>
          </div>
          <span className="hidden sm:flex items-center gap-1 rounded-full bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 shrink-0">
            <Clock className="h-3 w-3" /> 30 m
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <LanguageSwitcher variant="icon" />
          {isAuthenticated && (
            <Link
              href="/notifications"
              aria-label={t('nav.notifications')}
              className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-soft hover:bg-brand-50 transition-colors"
            >
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>
          )}
          <button
            onClick={openCart}
            aria-label={t('nav.cart')}
            className="relative flex h-9 w-9 items-center justify-center rounded-2xl bg-white text-gray-600 shadow-soft hover:bg-brand-50 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -end-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>
        </div>
      </div>

      <Link
        href="/search"
        className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm text-gray-500 shadow-soft hover:shadow-card transition-shadow"
      >
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <span className="truncate">{t('common.searchPlaceholder')}</span>
      </Link>
    </header>
  );
}
