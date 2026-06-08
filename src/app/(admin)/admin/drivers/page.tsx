'use client';
import { useTranslations } from 'next-intl';
import { StaffTable } from '@/components/admin/StaffTable';

export default function AdminDriversPage() {
  const t = useTranslations();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.drivers')}</h1>
      </div>
      <StaffTable role="DRIVER" countLabel={t('statuses.DELIVERED')} countKey="drivenOrders" />
    </div>
  );
}
