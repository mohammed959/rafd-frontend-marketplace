'use client';
import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, ToggleLeft, ToggleRight, CheckCircle2, Clock } from 'lucide-react';
import api from '@/lib/api';
import { SubscriptionPlan, Pagination } from '@/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { SubscriptionPlanDrawer } from '@/components/admin/SubscriptionPlanDrawer';
import { formatPrice, timeAgo, cn } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

type Tab = 'plans' | 'subscribers';
type SubStatus = 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';

interface SubscriberRow {
  id: string;
  status: SubStatus;
  startDate: string;
  expiryDate: string;
  paymentMethod: string;
  deliveriesUsed: number;
  createdAt: string;
  customer: { id: string; name: string | null; mobile: string };
  plan: { id: string; name: string; benefitType: string; durationDays: number };
}

const STATUS_COLOR: Record<SubStatus, string> = {
  PENDING_PAYMENT: 'bg-amber-100 text-amber-700',
  ACTIVE:          'bg-green-100 text-green-700',
  EXPIRED:         'bg-gray-100 text-gray-700',
  CANCELLED:       'bg-red-100 text-red-700',
};

const BENEFIT_LABEL: Record<string, string> = {
  FREE_DELIVERY:       'Free delivery',
  DISCOUNTED_DELIVERY: 'Discounted',
  CAPPED_DELIVERY:     'Capped fee',
};

export default function AdminSubscriptionsPage() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>('plans');

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.subscriptions')}</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {(['plans', 'subscribers'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            )}
          >
            {t === 'plans' ? 'Plans' : 'Subscribers'}
          </button>
        ))}
      </div>

      {tab === 'plans' ? <PlansTab /> : <SubscribersTab />}
    </div>
  );
}

function PlansTab() {
  const { data, isLoading, mutate } = useSWR<SubscriptionPlan[]>(
    '/subscriptions/admin/plans',
    fetcher
  );

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<SubscriptionPlan | null>(null);

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit   = (p: SubscriptionPlan) => { setEditing(p); setDrawerOpen(true); };

  const toggle = async (p: SubscriptionPlan) => {
    try {
      await api.patch(`/subscriptions/admin/plans/${p.id}/status`, {
        isActive: !(p as any).isActive,
      });
      await mutate();
      toast.success('Plan updated');
    } catch {
      toast.error('Failed to update plan');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Add plan
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <EmptyState title="No plans" description="Create your first delivery subscription plan." />
      ) : (
        <div className="space-y-2">
          {data.map((p) => {
            const isActive = (p as any).isActive ?? true;
            return (
              <div
                key={p.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-white p-4',
                  isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500" dir="rtl">{p.nameAr}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span className="font-semibold text-brand-600">{formatPrice(p.price)}</span>
                    <span>· {p.durationDays} days</span>
                    <span>· {BENEFIT_LABEL[p.benefitType] ?? p.benefitType}</span>
                    {p.discountValue != null && <span>· -{formatPrice(p.discountValue)} off</span>}
                    {p.cappedFee != null && <span>· cap {formatPrice(p.cappedFee)}</span>}
                    {p.maxFreeDeliveries != null && <span>· max {p.maxFreeDeliveries}</span>}
                  </div>
                </div>
                <button
                  onClick={() => toggle(p)}
                  className={cn(
                    'flex items-center gap-1 text-xs font-semibold',
                    isActive ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  {isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => openEdit(p)}
                  aria-label="Edit"
                  className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <SubscriptionPlanDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        onSaved={() => mutate()}
        plan={editing}
      />
    </div>
  );
}

function SubscribersTab() {
  const [statusFilter, setStatusFilter] = useState<SubStatus | ''>('');
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), ...(statusFilter && { status: statusFilter }) });
  const { data, isLoading, mutate } = useSWR<{ subscriptions: SubscriberRow[]; pagination: Pagination }>(
    `/subscriptions/admin/subscribers?${params}`,
    fetcher
  );

  const confirm = async (id: string) => {
    try {
      await api.patch(`/subscriptions/admin/${id}/confirm`);
      await mutate();
      toast.success('Subscription activated');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to confirm');
    }
  };

  const subs = data?.subscriptions ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['', 'PENDING_PAYMENT', 'ACTIVE', 'EXPIRED', 'CANCELLED'] as const).map((s) => (
          <button
            key={s || 'all'}
            onClick={() => { setStatusFilter(s as SubStatus | ''); setPage(1); }}
            className={cn(
              'shrink-0 rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors',
              statusFilter === s
                ? 'bg-brand-500 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
            )}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : subs.length === 0 ? (
        <EmptyState title="No subscribers" />
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Started</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Expires</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {subs.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900">{s.customer.name ?? '—'}</p>
                    <p className="text-xs font-mono text-gray-500">{s.customer.mobile}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.plan.name}
                    <p className="text-[10px] text-gray-400">{BENEFIT_LABEL[s.plan.benefitType] ?? s.plan.benefitType}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('rounded-lg px-2 py-0.5 text-xs font-semibold', STATUS_COLOR[s.status])}>
                      {s.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(s.expiryDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {s.status === 'PENDING_PAYMENT' ? (
                      <Button size="sm" onClick={() => confirm(s.id)}>
                        <CheckCircle2 className="h-4 w-4" /> Confirm
                      </Button>
                    ) : s.status === 'ACTIVE' ? (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" /> {s.deliveriesUsed} used
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-gray-500">{pagination.total} subscriptions</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
