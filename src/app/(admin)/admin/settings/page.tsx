'use client';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { MapPin, ArrowRight } from 'lucide-react';

/**
 * Phase 4: delivery pricing and minimum-order configuration moved to
 * `/admin/branch-coverage`. This page is intentionally left as a
 * pointer card so operators land here and find the canonical location
 * instead of seeing a 404 or stale fields.
 */
export default function AdminSettingsPage() {
  const t = useTranslations();
  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">{t('admin.settings')}</h1>

      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-3">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50">
            <MapPin className="h-5 w-5 text-brand-500" />
          </div>
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-gray-900">Delivery, free-delivery threshold, and minimum order</p>
            <p className="text-sm text-gray-600 leading-relaxed">
              All delivery fee configuration — distance rules, the free delivery threshold, and the
              minimum order amount — is now managed in <strong>Branch &amp; Coverage</strong>. This page
              no longer applies delivery settings.
            </p>
          </div>
        </div>

        <Link
          href="/admin/branch-coverage"
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Go to Branch &amp; Coverage
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
