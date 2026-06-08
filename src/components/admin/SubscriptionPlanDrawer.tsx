'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { SubscriptionPlan } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const BENEFIT_TYPES = [
  { value: 'FREE_DELIVERY',       label: 'Free delivery' },
  { value: 'DISCOUNTED_DELIVERY', label: 'Discounted delivery' },
  { value: 'CAPPED_DELIVERY',     label: 'Capped delivery fee' },
] as const;

type BenefitType = typeof BENEFIT_TYPES[number]['value'];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  plan?: SubscriptionPlan | null;
}

export function SubscriptionPlanDrawer({ open, onClose, onSaved, plan }: Props) {
  const isEdit = Boolean(plan);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [price, setPrice] = useState('0');
  const [durationDays, setDurationDays] = useState('30');
  const [benefitType, setBenefitType] = useState<BenefitType>('FREE_DELIVERY');
  const [discountValue, setDiscountValue] = useState('');
  const [cappedFee, setCappedFee] = useState('');
  const [maxFreeDeliveries, setMaxFreeDeliveries] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (plan) {
      setName(plan.name);
      setNameAr(plan.nameAr);
      setPrice(String(plan.price));
      setDurationDays(String(plan.durationDays));
      setBenefitType(plan.benefitType as BenefitType);
      setDiscountValue(plan.discountValue != null ? String(plan.discountValue) : '');
      setCappedFee(plan.cappedFee != null ? String(plan.cappedFee) : '');
      setMaxFreeDeliveries(plan.maxFreeDeliveries != null ? String(plan.maxFreeDeliveries) : '');
      setIsActive(true);
    } else {
      setName(''); setNameAr(''); setPrice('0'); setDurationDays('30');
      setBenefitType('FREE_DELIVERY');
      setDiscountValue(''); setCappedFee(''); setMaxFreeDeliveries('');
      setIsActive(true);
    }
  }, [open, plan]);

  const handleSubmit = async () => {
    if (!name.trim() || !nameAr.trim()) return toast.error('Name (English + Arabic) is required');
    const priceN = Number(price);
    const durN   = parseInt(durationDays);
    if (!Number.isFinite(priceN) || priceN < 0) return toast.error('Price must be a non-negative number');
    if (!Number.isInteger(durN) || durN < 1) return toast.error('Duration must be ≥ 1 day');

    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        name: name.trim(),
        nameAr: nameAr.trim(),
        price: priceN,
        durationDays: durN,
        benefitType,
        ...(isEdit && { isActive }),
      };
      if (benefitType === 'DISCOUNTED_DELIVERY') {
        payload.discountValue = Number(discountValue) || 0;
        payload.cappedFee = null;
      } else if (benefitType === 'CAPPED_DELIVERY') {
        payload.cappedFee = Number(cappedFee) || 0;
        payload.discountValue = null;
      } else {
        payload.discountValue = null;
        payload.cappedFee = null;
      }
      payload.maxFreeDeliveries = maxFreeDeliveries.trim() ? parseInt(maxFreeDeliveries) : null;

      if (isEdit && plan) {
        await api.put(`/subscriptions/admin/plans/${plan.id}`, payload);
        toast.success('Plan updated');
      } else {
        await api.post('/subscriptions/admin/plans', payload);
        toast.success('Plan created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit plan' : 'Add subscription plan'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input label="Name (English)" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Name (Arabic)" value={nameAr} onChange={(e) => setNameAr(e.target.value)} dir="rtl" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Price (SAR)" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
            <Input label="Duration (days)" type="number" min="1" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Benefit</label>
            <select
              value={benefitType}
              onChange={(e) => setBenefitType(e.target.value as BenefitType)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {BENEFIT_TYPES.map((b) => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          {benefitType === 'DISCOUNTED_DELIVERY' && (
            <Input
              label="Delivery discount (SAR)"
              type="number"
              min="0"
              step="0.01"
              value={discountValue}
              onChange={(e) => setDiscountValue(e.target.value)}
            />
          )}
          {benefitType === 'CAPPED_DELIVERY' && (
            <Input
              label="Capped delivery fee (SAR)"
              type="number"
              min="0"
              step="0.01"
              value={cappedFee}
              onChange={(e) => setCappedFee(e.target.value)}
            />
          )}

          <Input
            label="Max free deliveries (leave empty for unlimited)"
            type="number"
            min="0"
            value={maxFreeDeliveries}
            onChange={(e) => setMaxFreeDeliveries(e.target.value)}
          />

          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-brand-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Plan is bookable (active)</span>
            </label>
          )}
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Create plan'}
          </Button>
        </div>
      </div>
    </>
  );
}
