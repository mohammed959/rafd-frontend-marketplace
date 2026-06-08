import { clsx, type ClassValue } from 'clsx';
import { OrderStatus, VariantType } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number | string): string {
  return `${Number(amount).toFixed(2)} SAR`;
}

export function variantLabel(type: VariantType): string {
  const map: Record<VariantType, string> = {
    PIECE: 'Piece',
    CARTON: 'Carton',
    DOZEN: 'Dozen',
    BUNDLE: 'Bundle',
  };
  return map[type];
}

export const VARIANT_LABEL_AR: Record<VariantType, string> = {
  PIECE:  'حبة',
  CARTON: 'كرتون',
  DOZEN:  'دزينة',
  BUNDLE: 'باقة',
};

export function variantLabelLocalized(type: VariantType, locale: 'ar' | 'en'): string {
  return locale === 'ar' ? VARIANT_LABEL_AR[type] : variantLabel(type);
}

export function orderStatusLabel(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    NEW: 'New',
    PAYMENT_VERIFIED: 'Payment verified',
    ASSIGNED_TO_PICKER: 'Preparing',
    PICKING_IN_PROGRESS: 'Picking',
    READY_FOR_DELIVERY: 'Ready',
    READY_FOR_PICKUP: 'Ready for pickup',
    ASSIGNED_TO_DRIVER: 'With Driver',
    OUT_FOR_DELIVERY: 'On the Way',
    DELIVERED: 'Delivered',
    PICKED_UP_BY_CUSTOMER: 'Picked up',
    COMPLETED: 'Completed',
    CONFIRMED: 'Confirmed',
    CANCELLED: 'Cancelled',
    REJECTED: 'Rejected',
  };
  return map[status];
}

export function orderStatusColor(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    NEW: 'bg-blue-100 text-blue-700',
    PAYMENT_VERIFIED: 'bg-teal-100 text-teal-700',
    ASSIGNED_TO_PICKER: 'bg-yellow-100 text-yellow-700',
    PICKING_IN_PROGRESS: 'bg-orange-100 text-orange-700',
    READY_FOR_DELIVERY: 'bg-purple-100 text-purple-700',
    READY_FOR_PICKUP: 'bg-purple-100 text-purple-700',
    ASSIGNED_TO_DRIVER: 'bg-indigo-100 text-indigo-700',
    OUT_FOR_DELIVERY: 'bg-brand-100 text-brand-700',
    DELIVERED: 'bg-green-100 text-green-700',
    PICKED_UP_BY_CUSTOMER: 'bg-green-100 text-green-700',
    COMPLETED: 'bg-green-200 text-green-800',
    CONFIRMED: 'bg-green-200 text-green-800',
    CANCELLED: 'bg-gray-100 text-gray-600',
    REJECTED: 'bg-red-100 text-red-700',
  };
  return map[status];
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
