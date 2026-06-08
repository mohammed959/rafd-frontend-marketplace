import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-brand-500', className)} />;
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
