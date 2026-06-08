'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '@/types';
import api from '@/lib/api';

const STAFF_ROLES: Role[] = ['SUPER_ADMIN', 'PICKER', 'DRIVER'];

interface StaffAuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  staffLogin: (email: string, password: string) => Promise<User>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

/**
 * Staff-only authentication store. Used by /admin, /picker and /driver
 * portals. Persists under `staff-auth-storage` — that JSON blob is the
 * single source of truth for the bearer token; the api interceptor reads
 * it directly. Completely independent of the customer auth store, so an
 * admin can stay signed in while a customer session lives alongside it
 * in the same browser.
 */
export const useStaffAuthStore = create<StaffAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      staffLogin: async (email, password) => {
        const res = await api.post('/auth/staff/login', { email, password });
        const { token, user } = res.data.data;
        set({ token, user, isAuthenticated: true });
        return user;
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      fetchMe: async () => {
        try {
          set({ loading: true });
          const res = await api.get('/auth/me');
          if (!STAFF_ROLES.includes(res.data.data.role)) {
            set({ user: null, token: null, isAuthenticated: false });
            return;
          }
          set({ user: res.data.data, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'staff-auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
