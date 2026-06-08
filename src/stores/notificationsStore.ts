import { create } from 'zustand';
import api from '@/lib/api';
import { Notification } from '@/types';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loaded: boolean;
  load: () => Promise<void>;
  reset: () => void;
  markAllRead: () => Promise<void>;
  markOneRead: (id: string) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],
  unreadCount: 0,
  loaded: false,

  load: async () => {
    try {
      const res = await api.get<{ data: { notifications: Notification[]; unreadCount: number } }>(
        '/notifications'
      );
      set({
        items: res.data.data.notifications,
        unreadCount: res.data.data.unreadCount,
        loaded: true,
      });
    } catch {
      set({ loaded: true });
    }
  },

  reset: () => set({ items: [], unreadCount: 0, loaded: false }),

  markAllRead: async () => {
    const prev = get().items;
    set({
      items: prev.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
    try {
      await api.patch('/notifications/read-all');
    } catch {
      set({ items: prev, unreadCount: prev.filter((n) => !n.isRead).length });
    }
  },

  markOneRead: async (id) => {
    const prev = get().items;
    const wasUnread = prev.find((n) => n.id === id && !n.isRead);
    if (!wasUnread) return;
    set({
      items: prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      set({ items: prev, unreadCount: get().unreadCount + 1 });
    }
  },
}));
