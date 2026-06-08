'use client';
import { useTranslations } from 'next-intl';
import { StaffTable } from '@/components/admin/StaffTable';

export default function AdminPickersPage() {
  const t = useTranslations();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.pickers')}</h1>
      </div>
      <StaffTable role="PICKER" countLabel={t('picker.picked')} countKey="pickedOrders" />
    </div>
  );
}
