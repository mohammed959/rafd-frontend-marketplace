'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useStaffAuthStore } from '@/stores/staffAuthStore';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { PageSpinner } from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useStaffAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const isLoginRoute = pathname === '/admin/login';
  // Wait for Zustand to rehydrate from localStorage before checking auth
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoginRoute) return;
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else if (user && user.role !== 'SUPER_ADMIN') {
      // Non-admin staff get bounced to their own portal, NOT to the customer
      // storefront — the two scopes are isolated.
      router.push(user.role === 'PICKER' ? '/picker' : user.role === 'DRIVER' ? '/driver' : '/admin/login');
    }
  }, [hydrated, isAuthenticated, user, router, isLoginRoute]);

  // Login route renders standalone (no sidebar, no auth gate).
  if (isLoginRoute) return <>{children}</>;

  // Show spinner while hydrating or before user is confirmed
  if (!hydrated || !user) return <PageSpinner />;
  if (user.role !== 'SUPER_ADMIN') return <PageSpinner />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  );
}
