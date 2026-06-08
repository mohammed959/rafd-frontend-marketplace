'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PageSpinner } from '@/components/ui/Spinner';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function AdminSettingsPage() {
  const t = useTranslations();
  const { data: delivery, isLoading: loadingDelivery, mutate: mutateDelivery } = useSWR('/delivery/settings', fetcher);
  const { data: minOrder, isLoading: loadingMin, mutate: mutateMin } = useSWR('/delivery/minimum-order', fetcher);

  const [deliveryForm, setDeliveryForm] = useState<any>(null);
  const [minOrderForm, setMinOrderForm] = useState<any>(null);
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [savingMin, setSavingMin] = useState(false);

  useEffect(() => { if (delivery) setDeliveryForm(delivery); }, [delivery]);
  useEffect(() => { if (minOrder) setMinOrderForm(minOrder); }, [minOrder]);

  const saveDelivery = async () => {
    setSavingDelivery(true);
    try {
      await api.put('/delivery/settings', deliveryForm);
      await mutateDelivery();
      toast.success('Delivery settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSavingDelivery(false); }
  };

  const saveMinOrder = async () => {
    setSavingMin(true);
    try {
      await api.put('/delivery/minimum-order', minOrderForm);
      await mutateMin();
      toast.success('Minimum order settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setSavingMin(false); }
  };

  if (loadingDelivery || loadingMin) return <PageSpinner />;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings')}</h1>

      {/* Delivery pricing */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Delivery Pricing</h2>

        {deliveryForm && (
          <>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deliveryForm.distancePricingEnabled}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, distancePricingEnabled: e.target.checked })}
                className="accent-brand-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Enable distance-based pricing</span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <Input label="Base Fee (SAR)" type="number" value={deliveryForm.baseFee}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, baseFee: parseFloat(e.target.value) })} />
              <Input label="Fee per KM (SAR)" type="number" value={deliveryForm.feePerKm}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, feePerKm: parseFloat(e.target.value) })} />
              <Input label="Min Fee (SAR)" type="number" value={deliveryForm.minimumFee}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, minimumFee: parseFloat(e.target.value) })} />
              <Input label="Max Fee (SAR)" type="number" value={deliveryForm.maximumFee}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, maximumFee: parseFloat(e.target.value) })} />
            </div>

            <div className="border-t pt-3 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={deliveryForm.freeDeliveryEnabled}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryEnabled: e.target.checked })}
                  className="accent-brand-500 h-4 w-4" />
                <span className="text-sm font-medium text-gray-700">Enable free delivery threshold</span>
              </label>
              {deliveryForm.freeDeliveryEnabled && (
                <Input label="Threshold Amount (SAR)" type="number" value={deliveryForm.freeDeliveryThreshold ?? ''}
                  onChange={(e) => setDeliveryForm({ ...deliveryForm, freeDeliveryThreshold: parseFloat(e.target.value) })} />
              )}
            </div>

            <Button loading={savingDelivery} onClick={saveDelivery}>Save Delivery Settings</Button>
          </>
        )}
      </div>

      {/* Minimum order */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold text-gray-900">Minimum Order</h2>

        {minOrderForm && (
          <>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={minOrderForm.enabled}
                onChange={(e) => setMinOrderForm({ ...minOrderForm, enabled: e.target.checked })}
                className="accent-brand-500 h-4 w-4" />
              <span className="text-sm font-medium text-gray-700">Enforce minimum order amount</span>
            </label>
            {minOrderForm.enabled && (
              <Input label="Minimum Amount (SAR)" type="number" value={minOrderForm.minimumAmount}
                onChange={(e) => setMinOrderForm({ ...minOrderForm, minimumAmount: parseFloat(e.target.value) })} />
            )}
            <Button loading={savingMin} onClick={saveMinOrder}>Save Minimum Order Settings</Button>
          </>
        )}
      </div>
    </div>
  );
}
