'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { useStaffAuthStore } from '@/stores/staffAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BrandLogo } from '@/components/common/BrandLogo';
import { Role } from '@/types';

const ROLE_HOME: Record<Role, string> = {
  SUPER_ADMIN: '/admin',
  PICKER: '/picker',
  DRIVER: '/driver',
  CUSTOMER: '/login',
};

export default function StaffLoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { staffLogin, isAuthenticated, user } = useStaffAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If a staff member already has a session, send them straight to their portal.
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    if (user.role === 'CUSTOMER') return;
    router.replace(ROLE_HOME[user.role]);
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError(t('staffAuth.fillBothFields'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      const user = await staffLogin(email.trim(), password);
      if (user.role === 'CUSTOMER') {
        setError(t('staffAuth.customersNotAllowed'));
        return;
      }
      toast.success(t('auth.signIn'));
      router.push(ROLE_HOME[user.role] ?? '/');
    } catch (err: any) {
      setError(err.response?.data?.message ?? t('staffAuth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex items-center justify-center">
            <BrandLogo size="lg" priority />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('staffAuth.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('staffAuth.subtitle')}</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100 space-y-5">
          <Input
            label={t('staffAuth.email')}
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            dir="ltr"
          />

          <Input
            label={t('staffAuth.password')}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            dir="ltr"
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            {t('staffAuth.signIn')}
          </Button>

          <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-100">
            {t('staffAuth.customerHint')}
          </p>
        </div>
      </form>
    </div>
  );
}
