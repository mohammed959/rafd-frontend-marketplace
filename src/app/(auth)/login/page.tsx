'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';

type Step = 'phone' | 'otp';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { requestOtp, verifyOtp } = useCustomerAuthStore();
  const [step, setStep] = useState<Step>('phone');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [devCode, setDevCode] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (!mobile.trim()) { setError(t('validation.invalidPhone')); return; }
    setError('');
    setLoading(true);
    try {
      const result = await requestOtp(mobile.trim());
      setDevCode(result.code);
      setStep('otp');
      toast.success(t('auth.sendOtp'));
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('auth.sendOtp'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError(t('validation.invalidOtp')); return; }
    setError('');
    setLoading(true);
    try {
      await verifyOtp(mobile, otp);
      toast.success(t('auth.signIn'));

      // Customer OTP login only routes to the customer storefront.
      // Staff (admin/picker/driver) must use /admin/login.
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('validation.invalidOtp'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <BrandLogo size="lg" priority />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
          {step === 'phone' ? (
            <>
              <div>
                <h2 className="font-bold text-gray-900">{t('auth.signIn')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">{t('auth.signInToContinue')}</p>
              </div>
              <Input
                label={t('auth.mobileNumber')}
                type="tel"
                placeholder="+966 5XX XXX XXX"
                value={mobile}
                onChange={(e) => { setMobile(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleRequestOtp()}
                error={error}
              />
              <Button className="w-full" size="lg" loading={loading} onClick={handleRequestOtp}>
                {t('auth.sendOtp')}
              </Button>
            </>
          ) : (
            <>
              <div>
                <h2 className="font-bold text-gray-900">{t('auth.otp')}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="font-medium font-mono" dir="ltr">{mobile}</span>
                </p>
              </div>

              {devCode && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
                  <p className="text-xs font-medium text-amber-700">{t('auth.devOtp')}</p>
                  <p className="text-2xl font-black text-amber-800 tracking-widest" dir="ltr">{devCode}</p>
                </div>
              )}

              <Input
                label={t('auth.otp')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyOtp()}
                error={error}
                className="text-center text-2xl font-bold tracking-widest"
                dir="ltr"
              />
              <Button className="w-full" size="lg" loading={loading} onClick={handleVerifyOtp}>
                {t('auth.verifyAndSignIn')}
              </Button>
              <button
                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              >
                {t('auth.changeNumber')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
