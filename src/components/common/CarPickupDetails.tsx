'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Car, Save, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Order } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Props {
  order: Order;
  /** Customer view → editable; admin / picker → read-only. */
  mode: 'edit' | 'view';
  onUpdated?: () => void;
}

/**
 * Optional curbside-pickup vehicle info.
 *
 * - Only meaningful for Pickup-from-Branch orders that are still in flight.
 * - All fields are optional, every save is a PATCH of only the changed fields.
 * - In `view` mode (admin / picker) we render whatever exists and a friendly
 *   "no details yet" fallback when nothing is set.
 */
export function CarPickupDetails({ order, mode, onUpdated }: Props) {
  const t = useTranslations();
  const isPickup = order.fulfillmentType === 'PICKUP';
  const isLocked = order.status === 'COMPLETED' || order.status === 'CANCELLED' || order.status === 'REJECTED';

  if (!isPickup) return null;
  if (mode === 'edit' && isLocked) return null;

  const initial = {
    carPlateNumber: order.carPlateNumber ?? '',
    carBrand:       order.carBrand ?? '',
    carColor:       order.carColor ?? '',
    pickupCustomerNote: order.pickupCustomerNote ?? '',
  };

  if (mode === 'view') return <CarPickupView order={order} />;
  return <CarPickupEditor orderId={order.id} initial={initial} onUpdated={onUpdated} />;
}

function CarPickupView({ order }: { order: Order }) {
  const t = useTranslations();
  const anySet = Boolean(
    order.carPlateNumber || order.carBrand || order.carColor || order.pickupCustomerNote
  );

  return (
    <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-brand-500" />
        <p className="font-semibold text-gray-900">{t('carPickup.title')}</p>
      </div>

      {!anySet ? (
        <p className="text-sm text-gray-500">{t('carPickup.empty')}</p>
      ) : (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
          {order.carPlateNumber && <Row label={t('carPickup.plate')} value={order.carPlateNumber} mono />}
          {order.carBrand &&       <Row label={t('carPickup.brand')} value={order.carBrand} />}
          {order.carColor &&       <Row label={t('carPickup.color')} value={order.carColor} />}
          {order.pickupCustomerNote && (
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-wide text-gray-500">{t('carPickup.note')}</p>
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.pickupCustomerNote}</p>
            </div>
          )}
        </dl>
      )}
    </section>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-gray-500">{label}</dt>
      <dd className={mono ? 'text-sm font-mono font-semibold text-gray-900' : 'text-sm text-gray-800'}>
        {value}
      </dd>
    </div>
  );
}

function CarPickupEditor({
  orderId, initial, onUpdated,
}: {
  orderId: string;
  initial: { carPlateNumber: string; carBrand: string; carColor: string; pickupCustomerNote: string };
  onUpdated?: () => void;
}) {
  const t = useTranslations();
  const [plate, setPlate] = useState(initial.carPlateNumber);
  const [brand, setBrand] = useState(initial.carBrand);
  const [color, setColor] = useState(initial.carColor);
  const [note, setNote]   = useState(initial.pickupCustomerNote);
  const [saving, setSaving] = useState(false);
  const [clearing, setClearing] = useState(false);

  // Resync if the parent's order data changes (e.g. SWR refresh).
  useEffect(() => {
    setPlate(initial.carPlateNumber);
    setBrand(initial.carBrand);
    setColor(initial.carColor);
    setNote(initial.pickupCustomerNote);
    // initial is recomputed every render; effect depends on its values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.carPlateNumber, initial.carBrand, initial.carColor, initial.pickupCustomerNote]);

  const dirty =
    plate !== initial.carPlateNumber ||
    brand !== initial.carBrand ||
    color !== initial.carColor ||
    note  !== initial.pickupCustomerNote;

  const hasAnyValue = Boolean(plate || brand || color || note);
  const hasAnyExisting = Boolean(
    initial.carPlateNumber || initial.carBrand || initial.carColor || initial.pickupCustomerNote
  );

  const save = async () => {
    setSaving(true);
    try {
      // Send empty strings as `null` so the server clears those columns.
      const body = {
        carPlateNumber: plate.trim() || null,
        carBrand:       brand.trim() || null,
        carColor:       color.trim() || null,
        pickupCustomerNote: note.trim() || null,
      };
      await api.patch(`/orders/${orderId}/car-pickup-details`, body);
      toast.success(t('carPickup.saved'));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('carPickup.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const clear = async () => {
    if (!hasAnyExisting) return;
    setClearing(true);
    try {
      await api.delete(`/orders/${orderId}/car-pickup-details`);
      setPlate(''); setBrand(''); setColor(''); setNote('');
      toast.success(t('carPickup.cleared'));
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('carPickup.saveFailed'));
    } finally {
      setClearing(false);
    }
  };

  return (
    <section className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Car className="h-5 w-5 text-brand-500" />
        <p className="font-semibold text-gray-900">{t('carPickup.title')}</p>
      </div>
      <p className="text-xs text-gray-500">{t('carPickup.description')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label={t('carPickup.plate')}
          placeholder={t('carPickup.platePlaceholder')}
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
          maxLength={32}
        />
        <Input
          label={t('carPickup.brand')}
          placeholder={t('carPickup.brandPlaceholder')}
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          maxLength={64}
        />
        <Input
          label={t('carPickup.color')}
          placeholder={t('carPickup.colorPlaceholder')}
          value={color}
          onChange={(e) => setColor(e.target.value)}
          maxLength={32}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">{t('carPickup.note')}</label>
        <textarea
          rows={2}
          maxLength={500}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t('carPickup.notePlaceholder')}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={save} loading={saving} disabled={!dirty || saving}>
          <Save className="h-4 w-4" />
          {t('common.save')}
        </Button>
        {hasAnyExisting && (
          <Button size="sm" variant="secondary" onClick={clear} loading={clearing}>
            <Trash2 className="h-4 w-4" />
            {t('carPickup.clear')}
          </Button>
        )}
        {!hasAnyValue && !hasAnyExisting && (
          <p className="text-[11px] text-gray-400 ms-auto">{t('carPickup.allOptional')}</p>
        )}
      </div>
    </section>
  );
}
