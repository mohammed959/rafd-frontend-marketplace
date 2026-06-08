'use client';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg' | 'xl';

const DIMS: Record<Size, { width: number; height: number; cls: string }> = {
  sm: { width: 90,  height: 60,  cls: 'h-8 w-auto'  },
  md: { width: 120, height: 80,  cls: 'h-10 w-auto' },
  lg: { width: 180, height: 120, cls: 'h-16 w-auto' },
  xl: { width: 270, height: 180, cls: 'h-24 w-auto' },
};

export function BrandLogo({
  size = 'md',
  className,
  priority = false,
}: {
  size?: Size;
  className?: string;
  priority?: boolean;
}) {
  const dims = DIMS[size];
  return (
    <Image
      src="/mirad-logo.png"
      alt="Mirad"
      width={dims.width}
      height={dims.height}
      className={cn(dims.cls, 'object-contain select-none', className)}
      priority={priority}
    />
  );
}
