'use client';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const SIZES = {
  sm: { btn: 'h-7 w-7', icon: 'h-3.5 w-3.5', label: 'text-sm min-w-[1.5rem]' },
  md: { btn: 'h-9 w-9', icon: 'h-4 w-4', label: 'text-base min-w-[2rem]' },
  lg: { btn: 'h-11 w-11', icon: 'h-5 w-5', label: 'text-lg min-w-[2.5rem]' },
};

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max,
  size = 'md',
  disabled,
  className,
}: QuantityStepperProps) {
  const s = SIZES[size];
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(typeof max === 'number' ? Math.min(max, value + 1) : value + 1);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-full bg-brand-50 p-1 select-none',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <button
        type="button"
        onClick={dec}
        disabled={value <= min}
        className={cn(
          'flex items-center justify-center rounded-full bg-white text-brand-600 transition-colors',
          'hover:bg-brand-100 disabled:bg-transparent disabled:text-gray-400',
          s.btn
        )}
        aria-label="Decrease quantity"
      >
        <Minus className={s.icon} />
      </button>
      <span className={cn('text-center font-bold text-brand-700', s.label)}>{value}</span>
      <button
        type="button"
        onClick={inc}
        disabled={typeof max === 'number' && value >= max}
        className={cn(
          'flex items-center justify-center rounded-full bg-brand-500 text-white transition-colors',
          'hover:bg-brand-600 disabled:bg-gray-300',
          s.btn
        )}
        aria-label="Increase quantity"
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}
