import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export type StatusTone =
  | 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'violet';

interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: StatusTone;
  size?: 'xs' | 'sm';
}

const TONE: Record<StatusTone, string> = {
  neutral: 'bg-gray-100 text-gray-700',
  brand:   'bg-brand-100 text-brand-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger:  'bg-danger-100 text-danger-700',
  info:    'bg-info-100 text-info-700',
  violet:  'bg-violet-100 text-violet-700',
};

const SIZE = {
  xs: 'text-[10px] px-1.5 py-0.5 rounded-md',
  sm: 'text-xs px-2 py-0.5 rounded-lg',
};

export function StatusBadge({ tone = 'neutral', size = 'sm', className, ...rest }: StatusBadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 font-semibold uppercase tracking-wide', TONE[tone], SIZE[size], className)}
      {...rest}
    />
  );
}
