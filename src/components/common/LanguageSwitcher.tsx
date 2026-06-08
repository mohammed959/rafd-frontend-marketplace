'use client';
import { useTransition } from 'react';
import { Languages } from 'lucide-react';
import { setLocaleAction } from '@/i18n/setLocaleAction';
import { useLocale } from '@/i18n/useLocale';
import { cn } from '@/lib/utils';

interface Props {
  variant?: 'pill' | 'icon';
  className?: string;
}

export function LanguageSwitcher({ variant = 'pill', className }: Props) {
  const locale = useLocale();
  const [pending, startTransition] = useTransition();

  const next = locale === 'ar' ? 'en' : 'ar';
  const label = next === 'ar' ? 'العربية' : 'English';

  const onSwitch = () => {
    startTransition(async () => {
      await setLocaleAction(next);
      // Force a hard reload to re-evaluate dir + load the right messages
      window.location.reload();
    });
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onSwitch}
        disabled={pending}
        aria-label={label}
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 transition-colors',
          pending && 'opacity-50 cursor-wait',
          className
        )}
      >
        <Languages className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSwitch}
      disabled={pending}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-brand-300 transition-colors',
        pending && 'opacity-50 cursor-wait',
        className
      )}
    >
      <Languages className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
