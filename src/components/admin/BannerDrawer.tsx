'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Banner } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const LINK_TYPES = [
  { value: '',            label: 'None' },
  { value: 'category',    label: 'Category' },
  { value: 'subcategory', label: 'Subcategory (categoryId:subcategoryId)' },
  { value: 'product',     label: 'Product' },
  { value: 'url',         label: 'External URL' },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  banner?: Banner | null;
}

export function BannerDrawer({ open, onClose, onSaved, banner }: Props) {
  const isEdit = Boolean(banner);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkType, setLinkType] = useState('');
  const [linkValue, setLinkValue] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (banner) {
      setTitle(banner.title);
      setTitleAr(banner.titleAr);
      setImageUrl(banner.imageUrl);
      setLinkType(banner.linkType ?? '');
      setLinkValue(banner.linkValue ?? '');
      setSortOrder(String(banner.sortOrder ?? 0));
      setIsActive(banner.isActive);
    } else {
      setTitle(''); setTitleAr(''); setImageUrl('');
      setLinkType(''); setLinkValue('');
      setSortOrder('0'); setIsActive(true);
    }
  }, [open, banner]);

  const handleSubmit = async () => {
    if (!title.trim() || !titleAr.trim() || !imageUrl.trim()) {
      toast.error('Title, Arabic title, and image URL are required');
      return;
    }
    if (!/^https?:\/\//i.test(imageUrl.trim())) {
      toast.error('Image URL must start with http:// or https://');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        titleAr: titleAr.trim(),
        imageUrl: imageUrl.trim(),
        linkType: linkType || undefined,
        linkValue: linkType ? (linkValue.trim() || undefined) : undefined,
        sortOrder: Number(sortOrder) || 0,
        ...(isEdit && { isActive }),
      };
      if (isEdit && banner) {
        await api.put(`/banners/${banner.id}`, payload);
        toast.success('Banner updated');
      } else {
        await api.post('/banners', payload);
        toast.success('Banner created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save banner');
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
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit banner' : 'Add banner'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input label="Title (English)" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Summer offers" />
          <Input label="Title (Arabic)" value={titleAr} onChange={(e) => setTitleAr(e.target.value)} placeholder="عروض الصيف" dir="rtl" />
          <Input label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />

          {imageUrl && /^https?:\/\//i.test(imageUrl) && (
            <div className="overflow-hidden rounded-xl border border-gray-200">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Banner preview"
                className="max-h-40 w-full object-cover"
                onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Link type</label>
            <select
              value={linkType}
              onChange={(e) => setLinkType(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              {LINK_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {linkType && (
            <Input
              label={
                linkType === 'category' || linkType === 'product'
                  ? `${linkType} id`
                  : linkType === 'subcategory'
                    ? 'categoryId:subcategoryId'
                    : 'Full URL'
              }
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
            />
          )}

          <Input
            label="Sort order"
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />

          {isEdit && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="accent-brand-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Banner is visible (active)</span>
            </label>
          )}
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Create banner'}
          </Button>
        </div>
      </div>
    </>
  );
}
