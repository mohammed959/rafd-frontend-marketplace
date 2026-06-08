'use client';
import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Category } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  category?: Category | null;
}

export function CategoryDrawer({ open, onClose, onSaved, category }: Props) {
  const isEdit = Boolean(category);
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSlugTouched(false);
    if (category) {
      setName(category.name);
      setNameAr(category.nameAr);
      setSlug(category.slug);
      setSortOrder(String(category.sortOrder ?? 0));
      setIsActive(category.isActive);
    } else {
      setName(''); setNameAr(''); setSlug('');
      setSortOrder('0'); setIsActive(true);
    }
  }, [open, category]);

  // Auto-fill slug from English name in create mode unless edited
  useEffect(() => {
    if (!isEdit && !slugTouched) setSlug(slugify(name));
  }, [name, isEdit, slugTouched]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!nameAr.trim()) e.nameAr = 'Arabic name is required';
    if (!slug.trim()) e.slug = 'Slug is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        nameAr: nameAr.trim(),
        slug: slug.trim(),
        sortOrder: Number(sortOrder) || 0,
        ...(isEdit && { isActive }),
      };
      if (isEdit && category) {
        await api.put(`/categories/${category.id}`, payload);
        toast.success('Category updated');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to save category');
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
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Category' : 'Add Category'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
          <Input
            label="Name (English)"
            placeholder="e.g. Dairy"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Name (Arabic)"
            placeholder="مثال: ألبان"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            error={errors.nameAr}
            dir="rtl"
          />
          <Input
            label="Slug"
            placeholder="e.g. dairy"
            value={slug}
            onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
            error={errors.slug}
          />

          <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2.5 flex gap-2 items-start">
            <ImageIcon className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
            <p className="text-xs text-brand-700 leading-relaxed">
              Category image is loaded from Bunny CDN using the slug as image filename.
              Upload images to Bunny Storage as <span className="font-mono">category/&#123;slug&#125;.png</span>.
              Missing images fall back to a default category image automatically.
            </p>
          </div>

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
              <span className="text-sm font-medium text-gray-700">Category is visible (active)</span>
            </label>
          )}
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Category'}
          </Button>
        </div>
      </div>
    </>
  );
}
