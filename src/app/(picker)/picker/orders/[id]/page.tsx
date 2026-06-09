'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ProductImage } from '@/components/common/ProductImage';
import { CarPickupDetails } from '@/components/common/CarPickupDetails';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import {
  ArrowLeft, CheckCircle2, Replace, AlertTriangle, Trash2,
  Plus, X, Search,
} from 'lucide-react';
import api from '@/lib/api';
import { Order, OrderItem, OrderItemStatus, Product } from '@/types';
import { formatPrice, cn } from '@/lib/utils';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { FulfillmentBadge } from '@/components/common/FulfillmentBadge';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

const STATUS_STYLE: Record<OrderItemStatus, { bg: string; text: string }> = {
  PENDING:     { bg: 'bg-amber-100',   text: 'text-amber-700' },
  PICKED:      { bg: 'bg-green-100',   text: 'text-green-700' },
  UNAVAILABLE: { bg: 'bg-red-100',     text: 'text-red-700' },
  REPLACED:    { bg: 'bg-violet-100',  text: 'text-violet-700' },
  REMOVED:     { bg: 'bg-gray-200',    text: 'text-gray-600' },
};

const STATUS_KEY: Record<OrderItemStatus, string> = {
  PENDING:     'picker.toPick',
  PICKED:      'picker.picked',
  UNAVAILABLE: 'picker.unavailable',
  REPLACED:    'picker.replace',
  REMOVED:     'picker.remove',
};

/**
 * Resolve a localized display name + Bunny image + SKU for an order item,
 * preferring the Phase 6 snapshot fields and falling back through the
 * embedded product / legacy variant relations so legacy orders keep
 * rendering without code changes.
 */
function readItem(item: OrderItem, locale: 'en' | 'ar') {
  const productEntity = item.product ?? item.variant?.product ?? null;
  const name = item.productName
    ? (locale === 'ar' && item.productNameAr ? item.productNameAr : item.productName)
    : productEntity
      ? pickLocalized(productEntity, locale)
      : '—';
  const sku = item.productSku ?? productEntity?.sku ?? item.variant?.sku ?? null;
  const barcode = item.productBarcode ?? productEntity?.barcode ?? null;
  const imageUrl = productEntity?.imageUrl ?? null;
  return { name, sku, barcode, imageUrl };
}

export default function PickerOrderPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading, mutate } = useSWR<Order>(`/orders/${id}`, fetcher, { refreshInterval: 10000 });
  const [busy, setBusy] = useState(false);
  const [replacingItem, setReplacingItem] = useState<OrderItem | null>(null);

  const updateStatus = async (status: string, note?: string) => {
    setBusy(true);
    try {
      await api.patch(`/orders/${id}/status`, { status, note });
      await mutate();
      toast.success(t('common.save'));
      if (status === 'READY_FOR_DELIVERY' || status === 'READY_FOR_PICKUP') router.push('/picker');
    } catch {
      toast.error(t('common.save'));
    } finally {
      setBusy(false);
    }
  };

  const itemAction = async (
    item: OrderItem,
    status: 'PICKED' | 'UNAVAILABLE' | 'REMOVED'
  ) => {
    try {
      await api.patch(`/orders/${id}/items/${item.id}/status`, { status });
      await mutate();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('common.save'));
    }
  };

  if (isLoading || !order) return <PageSpinner />;

  const allActiveResolved = order.items
    .filter((i) => {
      const st = (i.status ?? 'PENDING') as OrderItemStatus;
      return st !== 'REMOVED' && st !== 'REPLACED' && st !== 'UNAVAILABLE';
    })
    .every((i) => (i.status ?? 'PENDING') === 'PICKED');

  const pendingCount = order.items.filter((i) => (i.status ?? 'PENDING') === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gray-50 p-4 space-y-4 max-w-lg mx-auto">
      <Link href="/picker" className="flex items-center gap-1.5 text-sm text-gray-500">
        <ArrowLeft className="h-4 w-4" /> {t('common.back')}
      </Link>

      <div className="rounded-2xl bg-white border border-gray-100 p-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-mono font-bold text-gray-900">{order.orderNumber}</p>
              <FulfillmentBadge type={order.fulfillmentType} />
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{pendingCount} / {order.items.length}</p>
          </div>
          <span className="rounded-xl bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700 shrink-0">
            {t(`statuses.${order.status}`)}
          </span>
        </div>

        {/* Curbside car-pickup details (read-only) — picker only sees them for
            their own assigned orders thanks to BE ownership. */}
        <div className="mt-3">
          <CarPickupDetails order={order} mode="view" />
        </div>

        <div className="space-y-2 mt-3">
          {order.items.map((item) => {
            const status = (item.status ?? 'PENDING') as OrderItemStatus;
            const style = STATUS_STYLE[status];
            const isFinal = status === 'REPLACED' || status === 'REMOVED';
            const { name, sku, barcode, imageUrl } = readItem(item, locale);
            return (
              <div
                key={item.id}
                className={cn(
                  'rounded-xl border p-3',
                  isFinal ? 'border-gray-100 bg-gray-50 opacity-70' : 'border-gray-100'
                )}
              >
                <div className="flex gap-3 items-center">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <ProductImage src={imageUrl} alt={name} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      × {item.quantity}{sku ? ` · SKU ${sku}` : ''}
                      {barcode ? ` · ${barcode}` : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatPrice(item.unitPrice)} {t('cart.items')}
                    </p>
                    {item.notes && (
                      <p className="text-[11px] text-violet-600 mt-0.5 italic">{item.notes}</p>
                    )}
                  </div>
                  <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide shrink-0', style.bg, style.text)}>
                    {t(STATUS_KEY[status])}
                  </span>
                </div>

                {!isFinal && status !== 'UNAVAILABLE' && (
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => itemAction(item, 'PICKED')}
                      disabled={status === 'PICKED'}
                      className={cn(
                        'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-semibold transition-colors',
                        status === 'PICKED'
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                      )}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t('picker.picked')}
                    </button>
                    <button
                      onClick={() => itemAction(item, 'UNAVAILABLE')}
                      className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-100 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-amber-100 hover:text-amber-700 transition-colors"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" /> {t('picker.unavailable')}
                    </button>
                    <button
                      onClick={() => setReplacingItem(item)}
                      className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-100 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-violet-100 hover:text-violet-700 transition-colors"
                    >
                      <Replace className="h-3.5 w-3.5" /> {t('picker.replace')}
                    </button>
                    <button
                      onClick={() => itemAction(item, 'REMOVED')}
                      className="flex flex-col items-center gap-0.5 rounded-lg bg-gray-100 py-1.5 text-[10px] font-semibold text-gray-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {t('picker.remove')}
                    </button>
                  </div>
                )}

                {status === 'UNAVAILABLE' && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => itemAction(item, 'PICKED')}
                      className="flex items-center justify-center gap-1 rounded-lg bg-green-100 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> {t('picker.picked')}
                    </button>
                    <button
                      onClick={() => setReplacingItem(item)}
                      className="flex items-center justify-center gap-1 rounded-lg bg-violet-100 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-200"
                    >
                      <Replace className="h-3.5 w-3.5" /> {t('picker.replace')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        {order.status === 'ASSIGNED_TO_PICKER' && (
          <Button className="w-full" size="lg" loading={busy}
            onClick={() => updateStatus('PICKING_IN_PROGRESS')}>
            {t('picker.startPicking')}
          </Button>
        )}
        {order.status === 'PICKING_IN_PROGRESS' && (
          <Button
            className="w-full"
            size="lg"
            loading={busy}
            disabled={!allActiveResolved}
            onClick={() =>
              updateStatus(order.fulfillmentType === 'PICKUP' ? 'READY_FOR_PICKUP' : 'READY_FOR_DELIVERY')
            }
          >
            {allActiveResolved
              ? order.fulfillmentType === 'PICKUP'
                ? t('picker.markReadyForPickup')
                : t('picker.markReady')
              : t('picker.resolveAllItems')}
          </Button>
        )}
        <div className="rounded-xl bg-white border border-gray-100 p-3 text-xs text-gray-500">
          {t('cart.total')}: <span className="font-bold text-brand-600">{formatPrice(order.total)}</span>
        </div>
      </div>

      {replacingItem && (
        <ReplaceItemSheet
          orderId={order.id}
          item={replacingItem}
          onClose={() => setReplacingItem(null)}
          onDone={() => { setReplacingItem(null); mutate(); }}
        />
      )}
    </div>
  );
}

function ReplaceItemSheet({
  orderId, item, onClose, onDone,
}: { orderId: string; item: OrderItem; onClose: () => void; onDone: () => void }) {
  const t = useTranslations();
  const locale = useLocale();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [qty, setQty] = useState(String(item.quantity));
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useSWR<{ products: Product[] }>(
    query.length >= 2 ? `/products/search?q=${encodeURIComponent(query)}` : null,
    fetcher
  );
  const products = data?.products ?? [];
  const original = readItem(item, locale);

  const submit = async () => {
    if (!selected) return toast.error(t('picker.replace'));
    setSaving(true);
    try {
      await api.post(`/orders/${orderId}/items/${item.id}/replace`, {
        productId: selected.id,
        quantity: Number(qty) > 0 ? Number(qty) : undefined,
      });
      toast.success(t('picker.replace'));
      onDone();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('picker.replace'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] flex-col rounded-t-3xl bg-white shadow-2xl">
        <div className="flex justify-center pt-2.5 pb-1">
          <div className="h-1 w-10 rounded-full bg-gray-300" />
        </div>
        <div className="flex items-center justify-between border-b px-5 py-3">
          <div>
            <h2 className="font-bold text-gray-900">{t('picker.replace')}</h2>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{original.name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="border-b px-5 py-3">
          <div className="relative">
            <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('common.searchPlaceholder')}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              className="w-full rounded-xl border border-gray-200 bg-white py-2.5 ps-9 pe-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {!query ? (
            <p className="text-sm text-gray-500 py-4 text-center">{t('common.searchPlaceholder')}</p>
          ) : isLoading ? (
            <Skeleton className="h-40 rounded-2xl" />
          ) : products.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">{t('products.noProducts')}</p>
          ) : (
            <ul className="space-y-2">
              {products.map((p) => {
                const productName = pickLocalized(p, locale);
                const stock = p.stock ?? 0;
                const reserved = p.reserved ?? 0;
                const available = p.available ?? (p.isActive && stock - reserved > 0);
                const isSel = selected?.id === p.id;
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      disabled={!available}
                      onClick={() => setSelected(p)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-xl border p-3 text-start transition-colors',
                        isSel
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-100 hover:border-brand-300',
                        !available && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                        <ProductImage src={p.imageUrl} alt={productName} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{productName}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {p.sku ? `SKU ${p.sku}` : ''}
                          {p.sku && available ? ' · ' : ''}
                          {available ? `${stock - reserved} ${t('cart.items')}` : t('products.outOfStock')}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-brand-600 shrink-0">
                        {p.price != null ? formatPrice(p.price) : '—'}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {selected && (
          <div className="border-t bg-gray-50 px-5 py-3">
            <p className="text-xs text-gray-500 mb-2">
              <span className="font-semibold text-gray-800">{pickLocalized(selected, locale)}</span>
              {selected.sku ? ` · SKU ${selected.sku}` : ''}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input label={t('cart.items')} type="number" min="1" value={qty} onChange={(e) => setQty(e.target.value)} />
              <Button className="col-span-2 self-end" loading={saving} onClick={submit}>
                <Plus className="h-4 w-4" /> {t('common.confirm')}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
