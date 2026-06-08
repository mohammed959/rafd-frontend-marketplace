'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRight, RefreshCw, LogOut } from 'lucide-react';
import api from '@/lib/api';
import { useStaffAuthStore } from '@/stores/staffAuthStore';
import { Order, Pagination } from '@/types';
import { orderStatusColor, formatPrice, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { FulfillmentBadge } from '@/components/common/FulfillmentBadge';
import { BrandLogo } from '@/components/common/BrandLogo';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function PickerPortalPage() {
  const t = useTranslations();
  const { user, isAuthenticated, logout } = useStaffAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const signOut = () => { logout(); router.push('/admin/login'); };

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) router.push('/admin/login');
    else if (user && user.role !== 'PICKER') router.push('/');
  }, [hydrated, isAuthenticated, user, router]);

  const { data, isLoading, mutate } = useSWR<{ orders: Order[]; pagination: Pagination }>(
    isAuthenticated ? '/orders' : null,
    fetcher,
    { refreshInterval: 15000 }
  );

  const orders = (data?.orders ?? []).filter((o) =>
    ['ASSIGNED_TO_PICKER', 'PICKING_IN_PROGRESS', 'NEW'].includes(o.status)
  );

  if (!hydrated || !user) return <PageSpinner />;
  if (isLoading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <BrandLogo size="sm" priority />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-gray-900 truncate">{t('picker.title')}</h1>
            <p className="text-sm text-gray-500 truncate">{user?.name ?? user?.mobile}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher variant="icon" />
          <Button variant="secondary" size="sm" onClick={() => mutate()} aria-label="Refresh">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            aria-label={t('auth.signOut')}
            className="text-red-500 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState title={t('picker.noAssigned')} description={t('picker.waitingForOrders')} />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/picker/orders/${order.id}`}
              className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
                  <FulfillmentBadge type={order.fulfillmentType} />
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${orderStatusColor(order.status)}`}>
                    {t(`statuses.${order.status}`)}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{order.items?.length ?? 0} {t('cart.items')} · {formatPrice(order.total)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 rtl:rotate-180" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
