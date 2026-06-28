'use client';
import { useTranslations } from 'next-intl';
import { KeyRound } from 'lucide-react';

/**
 * MVP/testing affordance: shows the generated OTP returned by the backend so
 * the customer can sign in without real SMS. The code is auto-generated,
 * unique per request, and invalidated when a new OTP is requested (handled
 * server-side). Renders nothing when no code is available (e.g. production,
 * where the backend does not return the OTP).
 */
export function OtpBadge({ code }: { code?: string | null }) {
  const t = useTranslations();
  if (!code) return null;
  return (
    <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
      <KeyRound className="h-4 w-4 shrink-0 text-amber-600" />
      <div className="leading-tight">
        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700">
          {t('auth.yourOtp')}
        </p>
        <p className="text-2xl font-black tracking-widest text-amber-800" dir="ltr">
          {code}
        </p>
      </div>
    </div>
  );
}
