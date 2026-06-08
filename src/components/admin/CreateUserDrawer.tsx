'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X, UserPlus } from 'lucide-react';
import api from '@/lib/api';
import { Role } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialRole?: Role;
}

const ROLES: { value: Role; label: string; sub: string }[] = [
  { value: 'CUSTOMER',    label: 'Customer',     sub: 'Shopper account' },
  { value: 'PICKER',      label: 'Picker',       sub: 'Warehouse staff' },
  { value: 'DRIVER',      label: 'Driver',       sub: 'Delivery driver' },
  { value: 'SUPER_ADMIN', label: 'Super admin',  sub: 'Full admin access' },
];

export function CreateUserDrawer({ open, onClose, onSaved, initialRole = 'CUSTOMER' }: Props) {
  const [mobile, setMobile] = useState('+966');
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [role, setRole] = useState<Role>(initialRole);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMobile('+966');
    setName('');
    setNameAr('');
    setRole(initialRole);
    setErrors({});
  }, [open, initialRole]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!/^\+?\d{8,15}$/.test(mobile.trim())) e.mobile = 'Enter a valid mobile number (e.g. +966500000099)';
    if (!name.trim()) e.name = 'Name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post('/users', {
        mobile: mobile.trim(),
        name: name.trim(),
        nameAr: nameAr.trim() || undefined,
        role,
      });
      toast.success('User created');
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-500" />
            <h2 className="font-bold text-gray-900 text-lg">Add user</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input
            label="Mobile number"
            placeholder="+966500000099"
            type="tel"
            inputMode="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            error={errors.mobile}
          />
          <p className="text-[11px] text-gray-400 -mt-2">
            Use international format with country code (e.g. <span className="font-mono">+966500000099</span>).
            The user signs in with this number via OTP — no password needed.
          </p>

          <Input
            label="Name"
            placeholder="Ahmed Ali"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Arabic name (optional)"
            placeholder="أحمد علي"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            dir="rtl"
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    'rounded-2xl border p-3 text-start transition-colors',
                    role === r.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-gray-200 bg-white hover:border-brand-300'
                  )}
                >
                  <p className={cn(
                    'text-sm font-semibold',
                    role === r.value ? 'text-brand-700' : 'text-gray-900'
                  )}>
                    {r.label}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{r.sub}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            Create user
          </Button>
        </div>
      </div>
    </>
  );
}
