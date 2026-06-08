import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api',
  headers: { 'Content-Type': 'application/json' },
});

const STAFF_PATH_PREFIXES = ['/admin', '/picker', '/driver'];

const CUSTOMER_STORE_KEY = 'customer-auth-storage';
const STAFF_STORE_KEY = 'staff-auth-storage';

function isStaffPath(path: string) {
  return STAFF_PATH_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Pick the Zustand-persisted store JSON that owns the session for the page
 * the request was fired from. Single source of truth — no parallel
 * `*_token` keys, which previously drifted out of sync with the persisted
 * state and produced a /admin ↔ /admin/login redirect loop on 401.
 */
function storeKeyForCurrentRoute() {
  if (typeof window === 'undefined') return CUSTOMER_STORE_KEY;
  return isStaffPath(window.location.pathname) ? STAFF_STORE_KEY : CUSTOMER_STORE_KEY;
}

function readPersistedToken(storeKey: string): string | null {
  try {
    const raw = localStorage.getItem(storeKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = readPersistedToken(storeKeyForCurrentRoute());
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      const path = window.location.pathname;
      // Failed staff/customer login forms should stay put.
      if (path === '/login' || path === '/admin/login') {
        return Promise.reject(err);
      }
      const staffContext = isStaffPath(path);
      // Drop the entire persisted store for this scope so the next page load
      // hydrates as unauthenticated. Clearing only a bearer key would leave
      // the store insisting `isAuthenticated: true`, which then bounces the
      // user back into the protected route and produces a redirect loop.
      localStorage.removeItem(staffContext ? STAFF_STORE_KEY : CUSTOMER_STORE_KEY);
      window.location.href = staffContext ? '/admin/login' : '/login';
    }
    return Promise.reject(err);
  },
);

export default api;
