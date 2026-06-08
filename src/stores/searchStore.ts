import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_RECENT = 8;

interface SearchState {
  recent: string[];
  pushRecent: (q: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      recent: [],
      pushRecent: (q) => {
        const term = q.trim();
        if (!term) return;
        const next = [term, ...get().recent.filter((r) => r !== term)].slice(0, MAX_RECENT);
        set({ recent: next });
      },
      clearRecent: () => set({ recent: [] }),
    }),
    { name: 'search-storage' }
  )
);
