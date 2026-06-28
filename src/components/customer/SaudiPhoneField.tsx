'use client';
import { cn } from '@/lib/utils';
import { sanitizeDigits, SAUDI_DIAL_CODE, SAUDI_LOCAL_MAX } from '@/lib/phone';

interface Props {
  label?: string;
  /** Local digits only (no country code). */
  value: string;
  /** Receives sanitized local digits (no country code, digits only). */
  onChange: (localDigits: string) => void;
  onEnter?: () => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Saudi-only phone input. The `+966` country code is rendered as a fixed,
 * non-editable, non-selectable prefix — the customer can only type the local
 * number, and only digits are accepted (letters/symbols/spaces/country code
 * are stripped on input). Always laid out LTR so the prefix stays on the left
 * even in RTL locales.
 */
export function SaudiPhoneField({
  label,
  value,
  onChange,
  onEnter,
  error,
  disabled,
  autoFocus,
}: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <div
        dir="ltr"
        className={cn(
          'flex items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white',
          'focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100',
          error && 'border-red-400 focus-within:border-red-400 focus-within:ring-red-100',
          disabled && 'bg-gray-50',
        )}
      >
        <span
          className="pointer-events-none select-none flex items-center gap-1 border-e border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-600"
          aria-hidden="true"
        >
          {SAUDI_DIAL_CODE}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={SAUDI_LOCAL_MAX}
          disabled={disabled}
          autoFocus={autoFocus}
          dir="ltr"
          placeholder="5XXXXXXXX"
          value={value}
          onChange={(e) => onChange(sanitizeDigits(e.target.value).slice(0, SAUDI_LOCAL_MAX))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && onEnter) onEnter();
          }}
          className="w-full bg-transparent px-3 py-3 text-sm tracking-wide placeholder:text-gray-400 focus:outline-none disabled:cursor-not-allowed"
          aria-label={label}
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
