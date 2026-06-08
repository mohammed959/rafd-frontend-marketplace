import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: 'brand' | 'green' | 'yellow' | 'red' | 'blue' | 'amber' | 'violet' | 'gray';
  subtitle?: string;
}

const colors = {
  brand:  { bg: 'bg-brand-50',  icon: 'text-brand-500',  value: 'text-brand-700' },
  green:  { bg: 'bg-green-50',  icon: 'text-green-500',  value: 'text-green-700' },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-500', value: 'text-yellow-700' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-500',    value: 'text-red-700' },
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-500',   value: 'text-blue-700' },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-500',  value: 'text-amber-700' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-500', value: 'text-violet-700' },
  gray:   { bg: 'bg-gray-100',  icon: 'text-gray-500',   value: 'text-gray-700' },
};

export function StatsCard({ title, value, icon: Icon, color = 'brand', subtitle }: StatsCardProps) {
  const c = colors[color];
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white border border-gray-100 p-5">
      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', c.bg)}>
        <Icon className={cn('h-6 w-6', c.icon)} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className={cn('text-2xl font-bold', c.value)}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
