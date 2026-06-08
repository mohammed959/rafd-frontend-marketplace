'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductImage } from '@/components/common/ProductImage';
import Link from 'next/link';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Plus, Minus, ChevronRight, Heart } from 'lucide-react';
import api from '@/lib/api';
import { Product, ProductVariant } from '@/types';
import { useCartStore } from '@/stores/cartStore';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { useLocale, pickLocalized } from '@/i18n/useLocale';
import { formatPrice, variantLabelLocalized, cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

function variantAvailable(v: ProductVariant): boolean {
  return v.available ?? (v.isActive && v.stock - v.reserved > 0);
}

export default function ProductDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const { data: product, isLoading, error } = useSWR<Product>(`/products/${params.id}`, fetcher);

  const items = useCartStore((s) => s.items);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);

  const isAuth = useCustomerAuthStore((s) => s.isAuthenticated);
  const isFav = useFavoritesStore((s) => product ? s.ids.has(product.id) : false);
  const toggleFav = useFavoritesStore((s) => s.toggle);

  const defaultVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find(variantAvailable) ?? product.variants[0] ?? null;
  }, [product]);

  const [selected, setSelected] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (defaultVariant && !selected) setSelected(defaultVariant);
  }, [defaultVariant, selected]);

  if (isLoading) {
    return (
      <div className="-mx-4 -my-4 min-h-screen bg-gray-50 px-4 py-4 space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-md space-y-4 py-12 text-center">
        <p className="font-semibold text-gray-700">{t('products.noProducts')}</p>
        <Link href="/" className="inline-block rounded-2xl bg-brand-500 px-5 py-2.5 text-sm font-bold text-white">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const variant = selected ?? defaultVariant;
  if (!variant) return null;

  const productName = pickLocalized(product, locale);
  const productAlt  = locale === 'ar' ? product.name : product.nameAr;
  const categoryName    = product.category ? pickLocalized(product.category, locale) : '';
  const subcategoryName = product.subcategory ? pickLocalized(product.subcategory, locale) : '';

  const cartItem = items.find((i) => i.variantId === variant.id);
  const available = variantAvailable(variant);

  const handleShare = async () => {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator;
    if (typeof nav.share === 'function') {
      try { await nav.share({ title: productName, url: window.location.href }); }
      catch { /* user cancelled */ }
      return;
    }
    if (nav.clipboard?.writeText) {
      try {
        await nav.clipboard.writeText(window.location.href);
        toast.success('Link copied');
      } catch { /* ignore */ }
    }
  };

  const handleFav = async () => {
    if (!isAuth) {
      toast(t('auth.signInToFavorite'));
      router.push('/login');
      return;
    }
    try { await toggleFav(product.id); } catch { /* ignore */ }
  };

  const handleAdd = () => {
    if (!available) return;
    if (cartItem) {
      updateQuantity(variant.id, cartItem.quantity + 1);
    } else {
      addItem({
        variantId: variant.id,
        productId: product.id,
        productName: product.name,
        productImage: product.imageUrl,
        variantType: variant.type,
        price: variant.price,
      });
    }
    toast.success(t('products.addToCart'));
  };

  return (
    // Break out of the parent's px-4/py-4 so we can paint the page fully.
    <div className="-mx-4 -my-4 min-h-screen bg-gray-50 pb-8">
      {/* Top bar: back / breadcrumb / share */}
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label={t('common.back')}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft hover:shadow-card transition-shadow active:scale-95"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700 rtl:rotate-180" />
        </button>

        <nav aria-label="breadcrumb" className="flex-1 overflow-hidden">
          <ol className="flex items-center justify-center gap-1.5 text-xs text-gray-500 truncate">
            <li>
              <Link href="/categories" className="hover:text-gray-700">{t('categories.allCategories')}</Link>
            </li>
            {categoryName && (
              <>
                <ChevronRight className="h-3 w-3 text-gray-300 shrink-0 rtl:rotate-180" />
                <li>
                  <Link href={`/product-list/${product.category.id}`} className="hover:text-gray-700 truncate">
                    {categoryName}
                  </Link>
                </li>
              </>
            )}
            {subcategoryName && (
              <>
                <ChevronRight className="h-3 w-3 text-gray-300 shrink-0 rtl:rotate-180" />
                <li>
                  <Link
                    href={`/product-list/${product.category.id}?sub=${product.subcategory!.id}`}
                    className="hover:text-gray-700 truncate font-semibold text-gray-700"
                  >
                    {subcategoryName}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <button
          type="button"
          onClick={handleShare}
          aria-label="Share"
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white shadow-soft hover:shadow-card transition-shadow active:scale-95"
        >
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* Hero: image on top on mobile (full width), side-by-side on sm+ */}
      <section className="px-4 mb-6">
        <div className="flex flex-col gap-4 sm:grid sm:grid-cols-12 sm:gap-4 sm:items-start">
          {/* Image */}
          <div className="sm:col-span-5">
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-white shadow-soft p-3">
              <ProductImage
                src={product.imageUrl}
                alt={productName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 320px"
                className="object-contain p-2"
                priority
              />
              {!available && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/80 backdrop-blur-sm">
                  <span className="rounded-lg bg-gray-800 px-2.5 py-1 text-xs font-semibold text-white">
                    {t('products.outOfStock')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="sm:col-span-7 flex flex-col gap-3 sm:pt-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {productName}
              </h1>
              {productAlt && (
                <p className="mt-1 text-xs text-gray-400 truncate" dir={locale === 'ar' ? 'ltr' : 'rtl'}>
                  {productAlt}
                </p>
              )}
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">
                {formatPrice(variant.price)}
              </span>
              <span className="text-[11px] font-medium text-gray-400">
                per {variantLabelLocalized(variant.type, locale)}
              </span>
            </div>

            <div className="mt-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-400">Found in</p>
              <Link
                href={`/product-list/${product.category.id}`}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                {categoryName}{subcategoryName ? ` · ${subcategoryName}` : ''}
              </Link>
            </div>

            {/* Quick actions — placed at the top so customers don't need to
                scroll down to add to cart or favourite. The CTA morphs into a
                live stepper once the item is in the cart. */}
            <div className="flex items-center gap-2 mt-1">
              {cartItem && available ? (
                <div className="flex flex-1 items-center justify-between gap-2 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 px-1.5 py-1 text-white shadow-soft">
                  <motion.button
                    type="button"
                    onClick={() => updateQuantity(variant.id, cartItem.quantity - 1)}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    aria-label="−"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                  >
                    <Minus className="h-4 w-4" strokeWidth={2.5} />
                  </motion.button>
                  <div className="flex-1 text-center leading-none">
                    <span className="text-base font-black">{cartItem.quantity}</span>
                    <span className="ms-1 text-[10px] font-semibold opacity-80">
                      {cartItem.quantity === 1 ? t('cart.item') : t('cart.items')}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => updateQuantity(variant.id, cartItem.quantity + 1)}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                    aria-label="+"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" strokeWidth={2.5} />
                  </motion.button>
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleAdd}
                  disabled={!available}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold shadow-soft transition-colors',
                    available
                      ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white hover:from-brand-600 hover:to-brand-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                  {available ? t('products.addToCart') : t('products.outOfStock')}
                </motion.button>
              )}
              <button
                type="button"
                onClick={handleFav}
                aria-label={t('nav.favorites')}
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-soft transition-colors',
                  isFav ? 'bg-danger-50 text-danger-600' : 'bg-white text-gray-600 hover:bg-brand-50'
                )}
              >
                <Heart className={cn('h-4 w-4', isFav && 'fill-danger-500 text-danger-500')} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About this product */}
      <section className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-soft">
        <h2 className="font-bold text-gray-900 mb-2">{t('products.description')}</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          {product.description ?? '—'}
        </p>
      </section>

      {product.variants.length > 1 && (
        <section className="mx-4 mb-4 rounded-3xl bg-white p-5 shadow-soft space-y-2">
          <label className="text-[10px] uppercase tracking-wider text-gray-400">
            {t('products.chooseSize')}
          </label>
          <div className="relative">
            <select
              value={variant.id}
              onChange={(e) => {
                const v = product.variants.find((x) => x.id === e.target.value);
                if (v) setSelected(v);
              }}
              className="
                w-full appearance-none rounded-2xl border border-gray-200 bg-white
                px-4 py-3 pe-10 text-sm font-semibold text-gray-900
                focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100
              "
            >
              {product.variants.map((v) => {
                const ok = variantAvailable(v);
                return (
                  <option key={v.id} value={v.id} disabled={!ok}>
                    {variantLabelLocalized(v.type, locale)} · {formatPrice(v.price)}
                    {!ok ? ` (${t('products.outOfStock')})` : ''}
                  </option>
                );
              })}
            </select>
            <ChevronRight className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-400" />
          </div>
        </section>
      )}

    </div>
  );
}
