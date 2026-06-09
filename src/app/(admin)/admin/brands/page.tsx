'use client';
import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Plus, Pencil, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Brand } from '@/types';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { Button } from '@/components/ui/Button';
import { BrandImage } from '@/components/common/BrandImage';
import { PageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { BrandDrawer } from '@/components/admin/BrandDrawer';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

interface DeleteResult {
  id: string;
  disabledInsteadOfDeleted: boolean;
  linkedProductCount: number;
}

export default function AdminBrandsPage() {
  const t = useTranslations();
  const locale = useLocale();
  // Admin views must see inactive brands too so they can re-activate them.
  const { data, isLoading, mutate } = useSWR<Brand[]>('/brands?all=true', fetcher);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [confirming, setConfirming] = useState<Brand | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const brands = data ?? [];

  const openCreate = () => { setEditing(null); setDrawerOpen(true); };
  const openEdit = (b: Brand) => { setEditing(b); setDrawerOpen(true); };
  const closeDrawer = () => { setDrawerOpen(false); setEditing(null); };

  const toggleActive = async (b: Brand) => {
    try {
      await api.put(`/brands/${b.id}`, { isActive: !b.isActive });
      await mutate();
      toast.success(b.isActive ? 'Brand deactivated' : 'Brand activated');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to update brand');
    }
  };

  const confirmDelete = async () => {
    if (!confirming) return;
    setDeletingId(confirming.id);
    try {
      const res = await api.delete<{ data: DeleteResult; message: string }>(`/brands/${confirming.id}`);
      const result = res.data?.data;
      await mutate();
      if (result?.disabledInsteadOfDeleted) {
        toast(
          `Brand disabled (${result.linkedProductCount} product${result.linkedProductCount === 1 ? '' : 's'} still reference it)`,
          { icon: '⚠️' },
        );
      } else {
        toast.success('Brand deleted');
      }
      setConfirming(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to delete brand');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.brands')}</h1>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t('admin.brands')}
        </Button>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : brands.length === 0 ? (
        <EmptyState
          title={t('brands.noBrands')}
          description={t('brands.noBrandsHint')}
        />
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden divide-y divide-gray-100">
          {brands.map((b) => (
            <div
              key={b.id}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                b.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="relative h-9 w-9 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                <BrandImage src={b.imageUrl} alt={b.name} fill sizes="36px" className="object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 leading-tight">{pickLocalized(b, locale)}</p>
                <p className="text-xs text-gray-400 mt-0.5" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                  {locale === 'ar' ? b.name : b.nameAr}
                </p>
              </div>

              <span className="font-mono text-xs text-gray-400 hidden sm:inline">{b.slug}</span>

              <button
                onClick={() => toggleActive(b)}
                className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                  b.isActive ? 'text-green-600' : 'text-gray-400'
                }`}
              >
                {b.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                {b.isActive ? t('common.active') : t('common.inactive')}
              </button>

              <button
                onClick={() => openEdit(b)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 hover:text-brand-600 transition-colors"
                title={t('admin.edit')}
              >
                <Pencil className="h-4 w-4" />
              </button>

              <button
                onClick={() => setConfirming(b)}
                className="rounded-md p-1.5 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                title={t('common.delete')}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <BrandDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSaved={() => mutate()}
        brand={editing}
      />

      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="font-bold text-gray-900 text-lg">{t('brands.confirmDeleteTitle')}</h3>
            <p className="text-sm text-gray-600 mt-2">
              {t('brands.confirmDeleteBody', { name: pickLocalized(confirming, locale) })}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              {t('brands.confirmDeleteHint')}
            </p>
            <div className="flex gap-3 mt-5">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirming(null)} disabled={Boolean(deletingId)}>
                {t('common.cancel')}
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 focus:ring-red-100"
                loading={deletingId === confirming.id}
                onClick={confirmDelete}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
