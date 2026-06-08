import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-gray-200/70 relative overflow-hidden',
        'before:absolute before:inset-0 before:animate-shimmer',
        'before:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)]',
        'before:bg-[length:200%_100%]',
        className
      )}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm">
      <Skeleton className="aspect-square w-full rounded-xl" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex items-center justify-between mt-1">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-5 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function CategoryChipSkeleton() {
  return <Skeleton className="h-9 w-24 rounded-full shrink-0" />;
}

export function CategoryBarSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="flex gap-2 overflow-x-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <CategoryChipSkeleton key={i} />
      ))}
    </div>
  );
}

export function OrderRowSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-4 w-12" />
    </div>
  );
}

export function BannerSkeleton() {
  return <Skeleton className="h-36 w-full rounded-2xl" />;
}
