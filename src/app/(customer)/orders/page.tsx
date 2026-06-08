'use client';
import useSWR from 'swr';
import Link from 'next/link';
import { ChevronRight, ScanLine, CalendarClock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Order, Pagination } from '@/types';
import { orderStatusColor, formatPrice, timeAgo } from '@/lib/utils';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { FulfillmentBadge } from '@/components/common/FulfillmentBadge';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function OrdersPage() {
  const t = useTranslations();
  const { isAuthenticated } = useCustomerAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useSWR<{ orders: Order[]; pagination: Pagination }>(
    isAuthenticated ? '/orders' : null,
    fetcher
  );

  const orders = data?.orders ?? [];

  if (isLoading) return <PageSpinner />;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">{t('orders.myOrders')}</h1>

      {orders.length === 0 ? (
        <EmptyState
          title={t('orders.noOrders')}
          description={t('cart.startShopping')}
          action={<Link href="/" className="text-sm font-medium text-brand-500 underline">{t('products.browseProducts')}</Link>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="font-bold text-gray-900 text-sm font-mono">{order.orderNumber}</p>
                  <FulfillmentBadge type={order.fulfillmentType} />
                  <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${orderStatusColor(order.status)}`}>
                    {t(`statuses.${order.status}`)}
                  </span>
                  {order.fulfillmentType === 'PICKUP' && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700"
                      title={t('orders.barcodeReady')}
                    >
                      <ScanLine className="h-3 w-3" />
                      {t('orders.barcodeReady')}
                    </span>
                  )}
                  {order.pickupType === 'SCHEDULED' && order.scheduledPickupDate && (
                    <span
                      className="inline-flex items-center gap-1 rounded-md bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700"
                      title={t('orders.scheduledPickup')}
                    >
                      <CalendarClock className="h-3 w-3" />
                      {new Date(order.scheduledPickupDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      {order.scheduledPickupStartTime && ` · ${order.scheduledPickupStartTime}`}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {order.items.length} {order.items.length === 1 ? t('cart.item') : t('cart.items')} · {formatPrice(order.total)}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(order.createdAt)}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 rtl:rotate-180" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
