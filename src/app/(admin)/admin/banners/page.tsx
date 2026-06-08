'use client';
import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Plus, ToggleLeft, ToggleRight, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import api from '@/lib/api';
import { Banner } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { BannerDrawer } from '@/components/admin/BannerDrawer';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

export default function AdminBannersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { data, isLoading, mutate } = useSWR<Banner[]>('/banners?all=true', fetcher);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const banners = data ?? [];

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit   = (b: Banner) => { setEditing(b); setDrawerOpen(true); };

  const toggle = async (b: Banner) => {
    try {
      await api.patch(`/banners/${b.id}/status`, { isActive: !b.isActive });
      await mutate();
      toast.success(`Banner ${!b.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update');
    }
  };

  const remove = async (b: Banner) => {
    if (!confirm(`Delete banner "${b.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/banners/${b.id}`);
      await mutate();
      toast.success('Banner deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const reorder = async (b: Banner, delta: -1 | 1) => {
    try {
      await api.put(`/banners/${b.id}`, { sortOrder: (b.sortOrder ?? 0) + delta });
      await mutate();
    } catch {
      toast.error('Failed to reorder');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.banners')}</h1>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> {t('admin.banners')}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <EmptyState
          title={t('admin.banners')}
          action={<Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> {t('admin.banners')}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 rounded-2xl border bg-white p-3 ${b.isActive ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}
            >
              <div className="relative h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{pickLocalized(b, locale)}</p>
                <p className="text-xs text-gray-500 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                  {locale === 'ar' ? b.title : b.titleAr}
                </p>
                {b.linkType && (
                  <p className="text-[11px] text-brand-600 mt-0.5">
                    → {b.linkType}{b.linkValue ? `: ${b.linkValue}` : ''}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5 text-xs text-gray-500">
                <button onClick={() => reorder(b, -1)} className="rounded-md p-1 hover:bg-gray-100">
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <span className="font-mono text-[10px]">{b.sortOrder ?? 0}</span>
                <button onClick={() => reorder(b, 1)} className="rounded-md p-1 hover:bg-gray-100">
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => toggle(b)}
                className={`flex items-center gap-1 text-xs font-semibold ${b.isActive ? 'text-green-600' : 'text-gray-400'}`}
              >
                {b.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {b.isActive ? t('common.active') : t('common.inactive')}
              </button>
              <button
                onClick={() => openEdit(b)}
                aria-label="Edit"
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-brand-600"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => remove(b)}
                aria-label="Delete"
                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <BannerDrawer
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setEditing(null); }}
        onSaved={() => mutate()}
        banner={editing}
      />
    </div>
  );
}
