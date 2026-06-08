import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type Tone   = 'default' | 'muted' | 'transparent';
type Shadow = 'soft' | 'card' | 'pop' | 'none';
type Pad    = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: Tone;
  shadow?: Shadow;
  pad?: Pad;
  interactive?: boolean;
}

const TONE: Record<Tone, string> = {
  default:     'bg-white border border-gray-100',
  muted:       'bg-gray-50 border border-gray-100',
  transparent: 'bg-transparent border border-transparent',
};

const SHADOW: Record<Shadow, string> = {
  soft: 'shadow-soft',
  card: 'shadow-card',
  pop:  'shadow-pop',
  none: '',
};

const PAD: Record<Pad, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { tone = 'default', shadow = 'soft', pad = 'md', interactive, className, ...rest },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl transition-shadow ease-out-soft',
        TONE[tone],
        SHADOW[shadow],
        PAD[pad],
        interactive && 'hover:shadow-card active:scale-[0.99] cursor-pointer',
        className
      )}
      {...rest}
    />
  );
});
