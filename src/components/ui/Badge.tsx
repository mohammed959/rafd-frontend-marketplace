import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'brand';
}

export function Badge({ children, className, variant = 'default' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    brand: 'bg-brand-100 text-brand-700',
  };

  return (
    <span className={cn('inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-semibold', variants[variant], className)}>
      {children}
    </span>
  );
}
