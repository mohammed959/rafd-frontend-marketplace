'use client';
import useSWR from 'swr';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Heart, ShoppingBag, Sparkles, Power,
  PackageSearch, Truck, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { OrderStatus, PaymentStatus } from '@/types';
import { formatPrice, orderStatusLabel, orderStatusColor, timeAgo } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

interface CustomerDetail {
  id: string;
  mobile: string;
  name: string | null;
  nameAr: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  addresses: Array<{
    id: string;
    label: string;
    addressLine: string | null;
    city: string | null;
    latitude: number;
    longitude: number;
    isDefault: boolean;
  }>;
  subscription: null | {
    id: string;
    status: 'PENDING_PAYMENT' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
    expiryDate: string;
    deliveriesUsed: number;
    plan: { name: string; benefitType: string; durationDays: number };
  };
  _count: {
    orders: number;
    addresses: number;
    favorites: number;
    pickedOrders: number;
    drivenOrders: number;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: number | string;
    createdAt: string;
    paymentMethod?: 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';
    paymentStatus?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
    picker?: { id: string; name: string | null; mobile: string } | null;
    driver?: { id: string; name: string | null; mobile: string } | null;
  }>;
}

export default function AdminCustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, mutate } = useSWR<CustomerDetail>(`/users/${id}`, fetcher);

  if (isLoading) return <Skeleton className="h-80 w-full rounded-2xl" />;
  if (!data) return <p className="py-12 text-center text-gray-500">Customer not found.</p>;

  const toggleActive = async () => {
    try {
      await api.patch(`/users/${data.id}/status`, { isActive: !data.isActive });
      await mutate();
      toast.success(`Customer ${!data.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const sub = data.subscription;

  return (
    <div className="space-y-5">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white border border-gray-100 p-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{data.name ?? 'Unnamed customer'}</h1>
          <p className="text-sm font-mono text-gray-500">{data.mobile}</p>
          <p className="text-xs text-gray-400 mt-1">
            Joined {timeAgo(data.createdAt)} · {data.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={`tel:${data.mobile}`}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-600"
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
          <a
            href={`https://wa.me/${data.mobile.replace(/[^\d]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-green-500 px-3 py-2 text-xs font-semibold text-white hover:bg-green-600"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
          <Button
            size="sm"
            variant={data.isActive ? 'danger' : 'secondary'}
            onClick={toggleActive}
          >
            <Power className="h-3.5 w-3.5" /> {data.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon={ShoppingBag} label="Orders"    value={data._count.orders}    />
        <StatTile icon={MapPin}      label="Addresses" value={data._count.addresses} />
        <StatTile icon={Heart}       label="Favorites" value={data._count.favorites} />
        <StatTile
          icon={Sparkles}
          label="Subscription"
          value={sub?.status ? sub.status.replace('_', ' ') : 'None'}
        />
      </div>

      {/* Subscription card */}
      {sub && (
        <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 text-sm">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-4 w-4 text-violet-500" />
            <p className="font-semibold text-violet-800">Subscription</p>
          </div>
          <p className="text-violet-700">{sub.plan.name}</p>
          <p className="text-xs text-violet-600/80 mt-0.5">
            {sub.status.replace('_', ' ')} · expires {new Date(sub.expiryDate).toLocaleDateString()} · {sub.deliveriesUsed} deliveries used
          </p>
        </div>
      )}

      {/* Addresses */}
      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Saved addresses</h2>
        {data.addresses.length === 0 ? (
          <p className="rounded-2xl bg-white border border-gray-100 p-4 text-sm text-gray-500">
            No saved addresses.
          </p>
        ) : (
          <div className="space-y-2">
            {data.addresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-white border border-gray-100 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                  <MapPin className="h-5 w-5 text-brand-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900">
                    {a.label}
                    {a.isDefault && (
                      <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
                        Default
                      </span>
                    )}
                  </p>
                  {a.addressLine && <p className="text-xs text-gray-500 mt-0.5">{a.addressLine}</p>}
                  {a.city && <p className="text-xs text-gray-500">{a.city}</p>}
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                    {Number(a.latitude).toFixed(4)}, {Number(a.longitude).toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Order history */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Order history ({data._count.orders})
          </h2>
          {data._count.orders > data.orders.length && (
            <Link
              href={`/admin/orders?customerId=${data.id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              See all <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </Link>
          )}
        </div>
        {data.orders.length === 0 ? (
          <p className="rounded-2xl bg-white border border-gray-100 p-4 text-sm text-gray-500">
            No orders yet.
          </p>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-50">
            {data.orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex flex-col gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-semibold text-gray-900">{o.orderNumber}</p>
                    <p className="text-xs text-gray-500">{timeAgo(o.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${orderStatusColor(o.status)}`}>
                      {orderStatusLabel(o.status)}
                    </span>
                    <span className="font-semibold text-brand-600">{formatPrice(o.total)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-gray-600">
                    <PackageSearch className="h-3 w-3" />
                    Picker:&nbsp;
                    <span className={o.picker ? 'font-semibold text-gray-900' : 'text-gray-400'}>
                      {o.picker?.name || o.picker?.mobile || 'Unassigned'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-gray-600">
                    <Truck className="h-3 w-3" />
                    Driver:&nbsp;
                    <span className={o.driver ? 'font-semibold text-gray-900' : 'text-gray-400'}>
                      {o.driver?.name || o.driver?.mobile || 'Unassigned'}
                    </span>
                  </span>
                  {o.paymentMethod && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-gray-600">
                      {o.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash' : 'Bank transfer'}
                      {o.paymentStatus && o.paymentMethod === 'BANK_TRANSFER' && (
                        <span className={`ml-1 rounded px-1 py-0.5 text-[9px] font-semibold uppercase ${
                          o.paymentStatus === 'APPROVED' ? 'bg-success-50 text-success-700' :
                          o.paymentStatus === 'REJECTED' ? 'bg-danger-50 text-danger-700' :
                          o.paymentStatus === 'UNDER_REVIEW' ? 'bg-warning-50 text-warning-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {o.paymentStatus.replace('_', ' ')}
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-4">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}
