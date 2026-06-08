import { cn } from '@/lib/utils';
import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <input
        className={cn(
          'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm',
          'placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-100',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
