'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Heart, RotateCcw, Receipt } from 'lucide-react';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { useFavoritesStore } from '@/stores/favoritesStore';

interface Tile {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  bg: string;
  fg: string;
}

export function HomeQuickTiles() {
  const t = useTranslations();
  const isAuth = useCustomerAuthStore((s) => s.isAuthenticated);
  const favCount = useFavoritesStore((s) => s.ids.size);

  const tiles: Tile[] = [
    {
      href: '/orders',
      label: t('nav.orders'),
      icon: Receipt,
      bg: 'bg-brand-50',
      fg: 'text-brand-600',
    },
    {
      href: '/buy-again',
      label: t('nav.buyAgain'),
      icon: RotateCcw,
      bg: 'bg-violet-50',
      fg: 'text-violet-500',
    },
    {
      href: '/favorites',
      label: t('nav.favorites'),
      icon: Heart,
      badge: favCount,
      bg: 'bg-rose-50',
      fg: 'text-rose-500',
    },
  ];

  if (!isAuth) return null;

  return (
    <section className="grid grid-cols-3 gap-2">
      {tiles.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-white border border-gray-100 px-2 py-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className={`relative flex h-10 w-10 items-center justify-center rounded-xl ${t.bg}`}>
            <t.icon className={`h-5 w-5 ${t.fg}`} />
            {typeof t.badge === 'number' && t.badge > 0 && (
              <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {t.badge > 9 ? '9+' : t.badge}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-gray-700 text-center">{t.label}</span>
        </Link>
      ))}
    </section>
  );
}
