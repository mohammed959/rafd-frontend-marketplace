'use client';
import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useFavoritesStore } from '@/stores/favoritesStore';
import { useCustomerAuthStore } from '@/stores/customerAuthStore';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  productId: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function FavoriteButton({ productId, size = 'sm', className }: FavoriteButtonProps) {
  const router = useRouter();
  const t = useTranslations();
  const isAuth = useCustomerAuthStore((s) => s.isAuthenticated);
  const isFav = useFavoritesStore((s) => s.ids.has(productId));
  const toggle = useFavoritesStore((s) => s.toggle);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuth) {
      toast(t('auth.signInToFavorite'));
      router.push('/login');
      return;
    }
    try {
      await toggle(productId);
    } catch {
      toast.error(t('orders.favoritesEmpty'));
    }
  };

  const dim = size === 'md' ? 'h-9 w-9' : 'h-7 w-7';
  const icon = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('nav.favorites')}
      className={cn(
        'flex items-center justify-center rounded-full bg-white/90 shadow-sm transition-transform active:scale-90 hover:scale-110',
        dim,
        className
      )}
    >
      <Heart
        className={cn(icon, 'transition-colors', isFav ? 'fill-red-500 text-red-500' : 'text-gray-500')}
      />
    </button>
  );
}
