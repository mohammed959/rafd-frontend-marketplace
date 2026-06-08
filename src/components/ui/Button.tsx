'use client';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-brand-500 text-white hover:bg-brand-600 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border-2 border-brand-500 text-brand-600 hover:bg-brand-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2',
  };

  return (
    <button
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
