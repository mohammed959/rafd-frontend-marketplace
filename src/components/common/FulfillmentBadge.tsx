'use client';
import { Store, Truck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FulfillmentType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  type: FulfillmentType;
  size?: 'sm' | 'md';
  className?: string;
}

export function FulfillmentBadge({ type, size = 'sm', className }: Props) {
  const t = useTranslations('admin');
  const isPickup = type === 'PICKUP';
  const Icon = isPickup ? Store : Truck;
  const styles = isPickup
    ? 'bg-violet-100 text-violet-700 border-violet-200'
    : 'bg-sky-100 text-sky-700 border-sky-200';
  const sizing = size === 'md' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-bold uppercase tracking-wide',
        styles,
        sizing,
        className
      )}
    >
      <Icon className={size === 'md' ? 'h-3.5 w-3.5' : 'h-3 w-3'} />
      {isPickup ? t('pickupOrder') : t('deliveryOrder')}
    </span>
  );
}
