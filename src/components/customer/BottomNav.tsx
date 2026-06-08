'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Home, LayoutGrid, Receipt, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations('nav');

  const NAV = [
    { href: '/',           label: t('home'),       icon: Home,       exact: true },
    { href: '/categories', label: t('categories'), icon: LayoutGrid },
    { href: '/orders',     label: t('orders'),     icon: Receipt },
    { href: '/favorites',  label: t('favorites'),  icon: Heart },
    { href: '/account',    label: t('account'),    icon: User },
  ];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/product-details')
  ) return null;

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-nav border-t border-gray-100 bg-white safe-bottom">
      <div className="flex px-2 py-2">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex flex-1 items-center justify-center transition-colors',
              )}
            >
              <div
                className={cn(
                  'flex flex-col items-center gap-0.5',
                )}
              >
                <span
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full transition-colors shadow-soft',
                    active ? 'bg-brand-500' : 'bg-white'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      active ? 'text-white' : 'text-gray-400'
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-semibold transition-colors pt-0.5',
                    active ? 'text-brand-700' : 'text-gray-500'
                  )}
                >
                  {label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
