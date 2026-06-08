'use client';
import { Check, Package, ShoppingBag, Truck, Home, Store, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { OrderStatus, FulfillmentType } from '@/types';
import { cn } from '@/lib/utils';

interface Step {
  key: OrderStatus | OrderStatus[];
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

const DELIVERY_STEPS: Step[] = [
  { key: 'NEW',                                                labelKey: 'statuses.NEW',                icon: ShoppingBag },
  { key: ['ASSIGNED_TO_PICKER', 'PICKING_IN_PROGRESS'],        labelKey: 'statuses.ASSIGNED_TO_PICKER', icon: Package },
  { key: ['READY_FOR_DELIVERY', 'ASSIGNED_TO_DRIVER'],         labelKey: 'statuses.READY_FOR_DELIVERY', icon: Package },
  { key: 'OUT_FOR_DELIVERY',                                   labelKey: 'statuses.OUT_FOR_DELIVERY',   icon: Truck },
  { key: ['DELIVERED', 'CONFIRMED', 'COMPLETED'],              labelKey: 'statuses.DELIVERED',          icon: Home },
];

const PICKUP_STEPS: Step[] = [
  { key: 'NEW',                                                labelKey: 'statuses.NEW',                  icon: ShoppingBag },
  { key: ['ASSIGNED_TO_PICKER', 'PICKING_IN_PROGRESS'],        labelKey: 'statuses.ASSIGNED_TO_PICKER',   icon: Package },
  { key: 'READY_FOR_PICKUP',                                   labelKey: 'statuses.READY_FOR_PICKUP',     icon: Store },
  { key: ['PICKED_UP_BY_CUSTOMER', 'COMPLETED'],               labelKey: 'statuses.PICKED_UP_BY_CUSTOMER', icon: Check },
];

const DELIVERY_ORDER: OrderStatus[] = [
  'NEW',
  'PAYMENT_VERIFIED',
  'ASSIGNED_TO_PICKER',
  'PICKING_IN_PROGRESS',
  'READY_FOR_DELIVERY',
  'ASSIGNED_TO_DRIVER',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CONFIRMED',
  'COMPLETED',
];

const PICKUP_ORDER: OrderStatus[] = [
  'NEW',
  'PAYMENT_VERIFIED',
  'ASSIGNED_TO_PICKER',
  'PICKING_IN_PROGRESS',
  'READY_FOR_PICKUP',
  'PICKED_UP_BY_CUSTOMER',
  'COMPLETED',
];

interface OrderStatusTimelineProps {
  status: OrderStatus;
  fulfillmentType?: FulfillmentType;
  className?: string;
}

export function OrderStatusTimeline({ status, fulfillmentType = 'DELIVERY', className }: OrderStatusTimelineProps) {
  const t = useTranslations();
  const isTerminated = status === 'CANCELLED' || status === 'REJECTED';

  if (isTerminated) {
    return (
      <div className={cn('flex items-center gap-3 rounded-2xl bg-red-50 px-4 py-3', className)}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
          <X className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-700">
            {t(`statuses.${status}`)}
          </p>
        </div>
      </div>
    );
  }

  const steps = fulfillmentType === 'PICKUP' ? PICKUP_STEPS : DELIVERY_STEPS;
  const order = fulfillmentType === 'PICKUP' ? PICKUP_ORDER : DELIVERY_ORDER;
  const statusIdx = Math.max(0, order.indexOf(status));

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {steps.map((step, idx) => {
        const stepKeys = Array.isArray(step.key) ? step.key : [step.key];
        const stepMaxIdx = Math.max(...stepKeys.map((k) => order.indexOf(k)));
        const active = statusIdx >= stepMaxIdx;
        const Icon = step.icon;
        return (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
                active ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              {active ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
            </div>
            <p
              className={cn(
                'text-sm transition-colors',
                active ? 'font-semibold text-gray-900' : 'text-gray-500'
              )}
            >
              {t(step.labelKey)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
