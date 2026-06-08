'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Phone, KeyRound } from 'lucide-react';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  onSuccess?: () => void;
}

export function InlineOtpLogin({ onSuccess }: Props) {
  const t = useTranslations();
  const { requestOtp, verifyOtp } = useCustomerAuthStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [mobile, setMobile] = useState('+966');
  const [code, setCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!/^\+?\d{8,15}$/.test(mobile.trim())) {
      toast.error(t('validation.invalidPhone'));
      return;
    }
    setLoading(true);
    try {
      const res = await requestOtp(mobile.trim());
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
    if (code.length < 4) {
      toast.error(t('validation.invalidOtp'));
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(mobile.trim(), code.trim());
      toast.success(t('auth.signIn'));
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('validation.invalidOtp'));
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
          <Input
            label={t('auth.mobileNumber')}
            type="tel"
            inputMode="tel"
            placeholder="+966500000001"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
          <Button className="w-full" loading={loading} onClick={handleRequest}>
            <Phone className="h-4 w-4" /> {t('auth.sendOtp')}
          </Button>
        </>
      ) : (
        <>
          {devCode && (
            <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">
              {t('auth.devOtp')}: <span className="font-mono font-bold tracking-widest">{devCode}</span>
            </div>
          )}
          <Input
            label={t('auth.otp')}
            type="text"
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
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
