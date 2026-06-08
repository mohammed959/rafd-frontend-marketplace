'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { X, UserPlus, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  role: Extract<Role, 'PICKER' | 'DRIVER'>;
}

export function CreateStaffDrawer({ open, onClose, onSaved, role }: Props) {
  const t = useTranslations();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setUsername('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setErrors({});
  }, [open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!username.trim()) e.username = t('staffMgmt.usernameRequired');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = t('staffMgmt.emailInvalid');
    }
    if (password.length < 8) e.password = t('staffMgmt.passwordMinLen');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users/staff', {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      toast.success(role === 'PICKER' ? t('staffMgmt.pickerCreated') : t('staffMgmt.driverCreated'));
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('staffMgmt.createFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  const title = role === 'PICKER' ? t('staffMgmt.addPicker') : t('staffMgmt.addDriver');

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-500" />
            <h2 className="font-bold text-gray-900 text-lg">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input
            label={t('staffMgmt.username')}
            placeholder="john.doe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            error={errors.username}
            autoComplete="off"
            dir="ltr"
          />

          <Input
            label={t('staffMgmt.email')}
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            autoComplete="off"
            dir="ltr"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">{t('staffMgmt.password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                dir="ltr"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pe-11 text-sm placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute end-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password
              ? <p className="text-xs text-red-600">{errors.password}</p>
              : <p className="text-[11px] text-gray-400">{t('staffMgmt.passwordHint')}</p>}
          </div>

          <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2.5">
            <p className="text-xs text-brand-700">
              {role === 'PICKER' ? t('staffMgmt.pickerHint') : t('staffMgmt.driverHint')}
            </p>
          </div>
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {t('staffMgmt.create')}
          </Button>
        </div>
      </div>
    </>
  );
}
