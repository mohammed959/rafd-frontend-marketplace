'use client';
import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useTranslations } from 'next-intl';
import { Search, ScrollText, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';
import { AuditLog, Pagination } from '@/types';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, timeAgo } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

const ENTITY_FILTERS = ['', 'order', 'order_item', 'promotion', 'product', 'banner', 'featured_section'] as const;

export default function AdminAuditLogsPage() {
  const t = useTranslations();
  const [entityType, setEntityType] = useState<string>('');
  const [actionQuery, setActionQuery] = useState('');
  const [debouncedAction, setDebouncedAction] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedAction(actionQuery), 300);
    return () => clearTimeout(t);
  }, [actionQuery]);
  useEffect(() => setPage(1), [entityType, debouncedAction]);

  const params = new URLSearchParams({ page: String(page), limit: '40' });
  if (entityType) params.set('entityType', entityType);
  if (debouncedAction) params.set('action', debouncedAction);

  const { data, isLoading } = useSWR<{ logs: AuditLog[]; pagination: Pagination }>(
    `/audit-logs?${params}`,
    fetcher,
    { refreshInterval: 20000 }
  );

  const logs = data?.logs ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.auditLogs')}</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {ENTITY_FILTERS.map((f) => (
            <button
              key={f || 'all'}
              onClick={() => setEntityType(f)}
              className={cn(
                'shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors capitalize',
                entityType === f
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-300'
              )}
            >
              {f ? f.replace('_', ' ') : 'All'}
            </button>
          ))}
        </div>
        <div className="relative md:max-w-xs md:flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Filter by action…"
            value={actionQuery}
            onChange={(e) => setActionQuery(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : logs.length === 0 ? (
        <EmptyState title="No log entries" description="Actions will appear here as they happen." />
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 overflow-hidden">
          <ul className="divide-y divide-gray-50">
            {logs.map((log) => (
              <li key={log.id} className="px-4 py-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                    <ScrollText className="h-4 w-4 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 font-mono text-sm">{log.action}</span>
                      <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
                        {log.entityType}
                      </span>
                      {log.entityId && (
                        <span className="text-[10px] font-mono text-gray-400 truncate">#{log.entityId.slice(0, 8)}</span>
                      )}
                    </div>
                    {log.actor && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <UserIcon className="h-3 w-3" />
                        {log.actor.name ?? log.actor.mobile}
                        <span className="text-gray-400">· {log.actor.role}</span>
                      </div>
                    )}
                    {log.changes != null && (
                      <pre className="mt-1.5 max-h-32 overflow-y-auto rounded-lg bg-gray-50 px-2.5 py-1.5 text-[11px] text-gray-600 font-mono whitespace-pre-wrap">
                        {JSON.stringify(log.changes, null, 2)}
                      </pre>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{timeAgo(log.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>

          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-gray-500">{pagination.total} entries</p>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button size="sm" variant="secondary" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
