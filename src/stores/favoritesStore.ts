import { create } from 'zustand';
import api from '@/lib/api';

interface FavoritesState {
  ids: Set<string>;
  loaded: boolean;
  load: () => Promise<void>;
  reset: () => void;
  isFavorite: (productId: string) => boolean;
  toggle: (productId: string) => Promise<boolean>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    try {
      const res = await api.get<{ data: string[] }>('/favorites/ids');
      set({ ids: new Set(res.data.data), loaded: true });
    } catch {
      set({ loaded: true });
    }
  },

  reset: () => set({ ids: new Set(), loaded: false }),

  isFavorite: (productId) => get().ids.has(productId),

  toggle: async (productId) => {
    const current = new Set(get().ids);
    const wasFav = current.has(productId);
    // Optimistic
    if (wasFav) current.delete(productId);
    else current.add(productId);
    set({ ids: current });
    try {
      if (wasFav) {
        await api.delete(`/favorites/${productId}`);
      } else {
        await api.post('/favorites', { productId });
      }
      return !wasFav;
    } catch (err) {
      // Roll back
      const rollback = new Set(get().ids);
      if (wasFav) rollback.add(productId);
      else rollback.delete(productId);
      set({ ids: rollback });
      throw err;
    }
  },
}));
