'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Phone, KeyRound } from 'lucide-react';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { SaudiPhoneField } from '@/components/customer/SaudiPhoneField';
import { OtpBadge } from '@/components/customer/OtpBadge';
import { validateSaudiLocal, normalizeSaudiPhone, SaudiPhoneError } from '@/lib/phone';

interface Props {
  onSuccess?: () => void;
}

export function InlineOtpLogin({ onSuccess }: Props) {
  const t = useTranslations();
  const { requestOtp, verifyOtp } = useCustomerAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  // Local Saudi digits only — the +966 prefix is fixed and not editable.
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  const phoneErrorMessage = (key: Exclude<SaudiPhoneError, null>): string =>
    key === 'len10'
      ? t('validation.saudiPhoneLen10')
      : key === 'len9'
        ? t('validation.saudiPhoneLen9')
        : t('validation.invalidSaudiPhone');

  const handleRequest = async () => {
    const err = validateSaudiLocal(mobile);
    if (err) {
      const msg = phoneErrorMessage(err);
      setPhoneError(msg);
      toast.error(msg);
      return;
    }
    setPhoneError('');
    setLoading(true);
    try {
      const res = await requestOtp(normalizeSaudiPhone(mobile));
      setDevCode(res?.code ?? null);
      setStep('otp');
      toast.success(t('auth.sendOtp'));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('auth.sendOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) {
      toast.error(t('auth.otpInvalid'));
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(normalizeSaudiPhone(mobile), code.trim());
      toast.success(t('auth.signIn'));
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('auth.otpInvalid'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-brand-500" />
        <h2 className="text-base font-semibold text-gray-900">{t('auth.signInToContinue')}</h2>
      </div>

      {step === 'phone' ? (
        <>
          <SaudiPhoneField
            label={t('auth.mobileNumber')}
            value={mobile}
            onChange={(digits) => { setMobile(digits); setPhoneError(''); }}
            onEnter={handleRequest}
            error={phoneError}
          />
          <Button className="w-full" loading={loading} onClick={handleRequest}>
            <Phone className="h-4 w-4" /> {t('auth.sendOtp')}
          </Button>
        </>
      ) : (
        <>
          <OtpBadge code={devCode} />
          <Input
            label={t('auth.otp')}
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            maxLength={6}
            dir="ltr"
          />
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" disabled={loading} onClick={() => { setStep('phone'); setCode(''); setDevCode(null); }}>
              {t('auth.changeNumber')}
            </Button>
            <Button className="flex-1" loading={loading} onClick={handleVerify}>
              {t('auth.verifyAndSignIn')}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
