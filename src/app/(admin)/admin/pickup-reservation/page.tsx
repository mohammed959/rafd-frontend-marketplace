'use client';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Plus, Trash2, Pencil, Power } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

interface PickupSettings {
  id: string;
  futurePickupEnabled: boolean;
  maxReservationDays: number;
  cutoffTime: string | null;
}

interface PickupSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  capacity: number;
  isActive: boolean;
  sortOrder: number;
}

export default function PickupReservationPage() {
  const t = useTranslations();
  const { data: settings, mutate: mutateSettings, isLoading: loadingSettings } =
    useSWR<PickupSettings>('/pickup/settings', fetcher);
  const { data: slots, mutate: mutateSlots, isLoading: loadingSlots } =
    useSWR<PickupSlot[]>('/pickup/slots?all=true', fetcher);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.pickupReservation')}</h1>
        <p className="text-sm text-gray-500 mt-1">{t('admin.pickupReservationHint')}</p>
      </div>

      {loadingSettings ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : settings ? (
        <SettingsCard settings={settings} onSaved={mutateSettings} />
      ) : null}

      {loadingSlots ? (
        <Skeleton className="h-64 rounded-2xl" />
      ) : (
        <SlotsCard slots={slots ?? []} onChanged={mutateSlots} />
      )}
    </div>
  );
}

function SettingsCard({ settings, onSaved }: { settings: PickupSettings; onSaved: () => void }) {
  const t = useTranslations();
  const [enabled, setEnabled] = useState(settings.futurePickupEnabled);
  const [maxDays, setMaxDays] = useState(String(settings.maxReservationDays));
  const [cutoff, setCutoff] = useState(settings.cutoffTime ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setEnabled(settings.futurePickupEnabled);
    setMaxDays(String(settings.maxReservationDays));
    setCutoff(settings.cutoffTime ?? '');
  }, [settings]);

  const save = async () => {
    setSaving(true);
    try {
      await api.patch('/pickup/settings', {
        futurePickupEnabled: enabled,
        maxReservationDays: parseInt(maxDays, 10) || 0,
        cutoffTime: cutoff.trim() || null,
      });
      toast.success(t('admin.pickupSettingsSaved'));
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('admin.pickupSettingsFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-5">
      <div>
        <h2 className="font-bold text-gray-900">{t('admin.pickupSettings')}</h2>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="accent-brand-500 h-4 w-4"
        />
        <span className="text-sm font-semibold text-gray-800">{t('admin.futurePickupEnabled')}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('admin.maxReservationDays')}</label>
          <select
            value={maxDays}
            onChange={(e) => setMaxDays(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            disabled={!enabled}
          >
            <option value="0">{t('admin.sameDayOnly')}</option>
            <option value="1">{t('admin.tomorrowOnly')}</option>
            <option value="3">{t('admin.upTo3Days')}</option>
            <option value="7">{t('admin.upTo7Days')}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">{t('admin.cutoffTime')}</label>
          <input
            type="time"
            value={cutoff}
            onChange={(e) => setCutoff(e.target.value)}
            placeholder="22:00"
            disabled={!enabled}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-gray-50"
          />
          <p className="text-[11px] text-gray-400">{t('admin.cutoffTimeHint')}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Button size="sm" onClick={save} loading={saving}>
          {t('common.save')}
        </Button>
      </div>
    </div>
  );
}

function SlotsCard({ slots, onChanged }: { slots: PickupSlot[]; onChanged: () => void }) {
  const t = useTranslations();
  const [editing, setEditing] = useState<PickupSlot | null>(null);
  const [creating, setCreating] = useState(false);

  const toggleActive = async (slot: PickupSlot) => {
    try {
      await api.put(`/pickup/slots/${slot.id}`, { isActive: !slot.isActive });
      onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('admin.pickupSettingsFailed'));
    }
  };

  const remove = async (slot: PickupSlot) => {
    if (!window.confirm(t('admin.confirmDeleteSlot'))) return;
    try {
      const res = await api.delete(`/pickup/slots/${slot.id}`);
      toast.success(res.data.message);
      onChanged();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('admin.pickupSettingsFailed'));
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900">{t('admin.pickupSlots')}</h2>
          <p className="text-xs text-gray-500 mt-0.5">{t('admin.pickupSlotsHint')}</p>
        </div>
        <Button size="sm" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          {t('admin.addSlot')}
        </Button>
      </div>

      {slots.length === 0 ? (
        <p className="text-sm text-gray-400 py-6 text-center">{t('admin.noSlotsYet')}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className={cn(
                'flex items-center gap-3 py-3',
                !slot.isActive && 'opacity-60'
              )}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{slot.label}</p>
                <p className="text-xs text-gray-500 font-mono" dir="ltr">
                  {slot.startTime} – {slot.endTime} · {t('admin.capacity')}: {slot.capacity}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  slot.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                )}
              >
                {slot.isActive ? t('admin.active') : t('admin.inactive')}
              </span>
              <button
                onClick={() => setEditing(slot)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label={t('common.save')}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleActive(slot)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100"
                aria-label={t('staffMgmt.toggleActive')}
              >
                <Power className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => remove(slot)}
                className="rounded-md p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
                aria-label={t('common.delete')}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(editing || creating) && (
        <SlotDrawer
          slot={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { onChanged(); setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function SlotDrawer({
  slot, onClose, onSaved,
}: {
  slot: PickupSlot | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useTranslations();
  const [label, setLabel] = useState(slot?.label ?? '');
  const [startTime, setStartTime] = useState(slot?.startTime ?? '09:00');
  const [endTime, setEndTime] = useState(slot?.endTime ?? '11:00');
  const [capacity, setCapacity] = useState(String(slot?.capacity ?? 20));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        label: label.trim() || `${startTime} - ${endTime}`,
        startTime,
        endTime,
        capacity: parseInt(capacity, 10) || 20,
      };
      if (slot) {
        await api.put(`/pickup/slots/${slot.id}`, payload);
      } else {
        await api.post('/pickup/slots', payload);
      }
      toast.success(slot ? t('admin.slotUpdated') : t('admin.slotCreated'));
      onSaved();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? t('admin.pickupSettingsFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 end-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="border-b px-5 py-4 shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">
            {slot ? t('admin.editSlot') : t('admin.addSlot')}
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input
            label={t('admin.slotLabel')}
            placeholder="9:00 AM - 11:00 AM"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t('admin.startTime')}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">{t('admin.endTime')}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <Input
            label={t('admin.capacity')}
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
          />
        </div>
        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={saving}>
            {t('common.cancel')}
          </Button>
          <Button className="flex-1" loading={saving} onClick={save}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </>
  );
}
