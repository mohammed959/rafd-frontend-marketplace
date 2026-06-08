import { PackageOpen } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <PackageOpen className="h-8 w-8 text-gray-400" />
      </div>
      <div>
        <p className="font-semibold text-gray-700">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {action}
    </div>
  );
}
