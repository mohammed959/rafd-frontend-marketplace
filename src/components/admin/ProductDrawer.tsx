'use client';
import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Category, Product, VariantType } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface VariantForm {
  id?: string;
  type: VariantType;
  sku: string;
  barcode: string;
  price: string;
  stock: string;
  isActive: boolean;
}

const VARIANT_TYPES: VariantType[] = ['PIECE', 'CARTON', 'DOZEN', 'BUNDLE'];
const VARIANT_LABELS: Record<VariantType, string> = {
  PIECE: 'Piece',
  CARTON: 'Carton',
  DOZEN: 'Dozen',
  BUNDLE: 'Bundle',
};

const emptyVariant = (): VariantForm => ({
  type: 'PIECE',
  sku: '',
  barcode: '',
  price: '',
  stock: '0',
  isActive: true,
});

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: Product | null;
}

export function ProductDrawer({ open, onClose, onSaved, product }: Props) {
  const isEdit = Boolean(product);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [hideFromHome, setHideFromHome] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([emptyVariant()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open && categories.length === 0) {
      api.get('/categories?all=true').then((r) => setCategories(r.data.data)).catch(() => {});
    }
  }, [open, categories.length]);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (product) {
      setName(product.name);
      setNameAr(product.nameAr);
      setCategoryId(product.category.id);
      setSubcategoryId(product.subcategory?.id ?? '');
      setDescription(product.description ?? '');
      setIsFeatured(product.isFeatured);
      setIsActive(product.isActive);
      setHideFromHome(Boolean(product.hideFromHome));
      setVariants(
        product.variants.length > 0
          ? product.variants.map((v) => ({
              id: v.id,
              type: v.type,
              sku: v.sku,
              barcode: v.barcode ?? '',
              price: String(v.price),
              stock: String(v.stock),
              isActive: v.isActive,
            }))
          : [emptyVariant()]
      );
    } else {
      setName(''); setNameAr(''); setCategoryId(''); setSubcategoryId('');
      setDescription(''); setIsFeatured(false); setIsActive(true);
      setHideFromHome(false);
      setVariants([emptyVariant()]);
    }
  }, [open, product]);

  const selectedCategory = categories.find((c) => c.id === categoryId);

  const updateVariant = <K extends keyof VariantForm>(index: number, field: K, value: VariantForm[K]) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()]);

  const removeVariant = (index: number) => {
    const v = variants[index];
    if (v.id) {
      toast.error('Existing variants cannot be removed. Deactivate them instead.');
      return;
    }
    if (variants.length === 1) return;
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Product name is required';
    if (!nameAr.trim()) e.nameAr = 'Arabic name is required';
    if (!categoryId) e.categoryId = 'Category is required';
    variants.forEach((v, i) => {
      if (!v.sku.trim()) e[`sku_${i}`] = 'SKU is required';
      if (!v.price || Number(v.price) <= 0) e[`price_${i}`] = 'Valid price is required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && product) {
        await api.put(`/products/${product.id}`, {
          name: name.trim(),
          nameAr: nameAr.trim(),
          categoryId,
          subcategoryId: subcategoryId || undefined,
          description: description.trim() || undefined,
          isFeatured,
          hideFromHome,
        });

        if (isActive !== product.isActive) {
          await api.patch(`/products/${product.id}/status`, { isActive });
        }

        for (const v of variants) {
          if (v.id) {
            await api.put(`/products/${product.id}/variants/${v.id}`, {
              price: Number(v.price),
              stock: Number(v.stock) || 0,
              barcode: v.barcode.trim() || undefined,
              isActive: v.isActive,
            });
          } else {
            await api.post(`/products/${product.id}/variants`, {
              type: v.type,
              sku: v.sku.trim(),
              barcode: v.barcode.trim() || undefined,
              price: Number(v.price),
              stock: Number(v.stock) || 0,
            });
          }
        }

        toast.success('Product updated');
      } else {
        await api.post('/products', {
          name: name.trim(),
          nameAr: nameAr.trim(),
          categoryId,
          subcategoryId: subcategoryId || undefined,
          description: description.trim() || undefined,
          isFeatured,
          hideFromHome,
          variants: variants.map((v) => ({
            type: v.type,
            sku: v.sku.trim(),
            barcode: v.barcode.trim() || undefined,
            price: Number(v.price),
            stock: Number(v.stock) || 0,
          })),
        });
        toast.success('Product created successfully');
      }
      onSaved();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Failed to save product';
      const errs = err.response?.data?.errors;
      if (errs) {
        toast.error(errs.map((e: any) => e.message).join(', '));
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 shrink-0">
          <h2 className="font-bold text-gray-900 text-lg">{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Basic Info</h3>

            <Input label="Product Name (English)" placeholder="e.g. Full Fat Milk" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
            <Input label="Product Name (Arabic)" placeholder="مثال: حليب كامل الدسم" value={nameAr} onChange={(e) => setNameAr(e.target.value)} error={errors.nameAr} dir="rtl" />
            <Input label="Description (optional)" placeholder="Short product description" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="rounded-xl bg-brand-50 border border-brand-100 px-3 py-2.5 flex gap-2 items-start">
              <ImageIcon className="h-4 w-4 text-brand-500 mt-0.5 shrink-0" />
              <p className="text-xs text-brand-700 leading-relaxed">
                Product image is loaded from Bunny CDN using product SKU as image filename.
                Upload images to Bunny Storage as <span className="font-mono">&#123;sku&#125;.jpg</span>.
                Missing images fall back to a default basket image automatically.
              </p>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="accent-brand-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">Featured product</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hideFromHome}
                onChange={(e) => setHideFromHome(e.target.checked)}
                className="accent-brand-500 h-4 w-4"
              />
              <span className="text-sm font-medium text-gray-700">
                Hide from home page "All products"
              </span>
            </label>

            {isEdit && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-brand-500 h-4 w-4"
                />
                <span className="text-sm font-medium text-gray-700">Product is visible (active)</span>
              </label>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Category</h3>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(''); }}
                className={`w-full rounded-xl border px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 ${
                  errors.categoryId ? 'border-red-400' : 'border-gray-200'
                }`}
              >
                <option value="">Select category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}{!c.isActive ? ' (inactive)' : ''}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-600">{errors.categoryId}</p>}
            </div>

            {selectedCategory && selectedCategory.subcategories.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Subcategory (optional)</label>
                <select
                  value={subcategoryId}
                  onChange={(e) => setSubcategoryId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">No subcategory</option>
                  {selectedCategory.subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}{!s.isActive ? ' (inactive)' : ''}</option>
                  ))}
                </select>
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Variants</h3>
              <button
                onClick={addVariant}
                className="flex items-center gap-1.5 rounded-lg border border-brand-300 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Variant
              </button>
            </div>

            {variants.map((variant, i) => (
              <div key={variant.id ?? `new-${i}`} className="rounded-xl border border-gray-200 p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Variant {i + 1}{variant.id ? '' : ' (new)'}
                  </span>
                  {!variant.id && variants.length > 1 && (
                    <button onClick={() => removeVariant(i)} className="text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Type</label>
                  <div className="flex flex-wrap gap-2">
                    {VARIANT_TYPES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        disabled={Boolean(variant.id)}
                        onClick={() => updateVariant(i, 'type', t)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                          variant.type === t
                            ? 'border-brand-500 bg-brand-50 text-brand-600'
                            : 'border-gray-200 text-gray-600 hover:border-brand-300'
                        } ${variant.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        {VARIANT_LABELS[t]}
                      </button>
                    ))}
                  </div>
                  {variant.id && <p className="text-xs text-gray-400">Variant type can&apos;t be changed after creation.</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="SKU *"
                    placeholder="e.g. MILK-1L-PC"
                    value={variant.sku}
                    onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                    error={errors[`sku_${i}`]}
                    disabled={Boolean(variant.id)}
                  />
                  <Input
                    label="Barcode"
                    placeholder="Optional"
                    value={variant.barcode}
                    onChange={(e) => updateVariant(i, 'barcode', e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Price (SAR) *"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={variant.price}
                    onChange={(e) => updateVariant(i, 'price', e.target.value)}
                    error={errors[`price_${i}`]}
                  />
                  <Input
                    label="Stock (units)"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={variant.stock}
                    onChange={(e) => updateVariant(i, 'stock', e.target.value)}
                  />
                </div>

                {variant.id && (
                  <label className="flex items-center gap-3 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={variant.isActive}
                      onChange={(e) => updateVariant(i, 'isActive', e.target.checked)}
                      className="accent-brand-500 h-4 w-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Variant is visible (active)</span>
                  </label>
                )}
              </div>
            ))}
          </section>
        </div>

        <div className="border-t bg-white px-5 py-4 flex gap-3 shrink-0">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" loading={loading} onClick={handleSubmit}>
            {isEdit ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </div>
    </>
  );
}
