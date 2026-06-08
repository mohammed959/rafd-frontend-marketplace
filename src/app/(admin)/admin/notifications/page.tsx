'use client';
import { useState } from 'react';
import useSWR from 'swr';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import { Send, History, Users, User as UserIcon, Search, Megaphone } from 'lucide-react';
import api from '@/lib/api';
import { Pagination, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, timeAgo } from '@/lib/utils';

const fetcher = (url: string) => api.get(url).then((r) => r.data.data);

type Tab = 'send' | 'history';

export default function AdminNotificationsPage() {
  const t = useTranslations();
  const [tab, setTab] = useState<Tab>('send');

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('admin.notifications')}</h1>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {([
          { key: 'send',    label: 'Send' },
          { key: 'history', label: 'History' },
        ] as const).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-brand-500 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'send' ? <SendTab /> : <HistoryTab />}
    </div>
  );
}

function SendTab() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [target, setTarget] = useState<'ALL_CUSTOMERS' | 'USER'>('ALL_CUSTOMERS');
  const [userQuery, setUserQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: searchResults } = useSWR<{ users: User[] }>(
    target === 'USER' && userQuery.length >= 2
      ? `/users?role=CUSTOMER&q=${encodeURIComponent(userQuery)}&limit=10`
      : null,
    fetcher
  );

  const submit = async () => {
    if (!title.trim() || !body.trim()) return toast.error('Title and body are required');
    if (target === 'USER' && !selectedUser) return toast.error('Pick a customer first');
    setLoading(true);
    try {
      const res = await api.post<{ data: { recipients: number }; message: string }>(
        '/notifications/admin/send',
        {
          title: title.trim(),
          body: body.trim(),
          target,
          userId: target === 'USER' ? selectedUser?.id : undefined,
        }
      );
      toast.success(res.data.message ?? 'Sent');
      setTitle(''); setBody(''); setSelectedUser(null); setUserQuery('');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Failed to send');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-4">
      <div className="rounded-2xl bg-white border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-brand-500" />
          <h2 className="font-semibold text-gray-900">Compose</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => { setTarget('ALL_CUSTOMERS'); setSelectedUser(null); }}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
              target === 'ALL_CUSTOMERS'
                ? 'border-brand-300 bg-brand-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            )}
          >
            <Users className={cn('h-5 w-5', target === 'ALL_CUSTOMERS' ? 'text-brand-500' : 'text-gray-500')} />
            <div>
              <p className="font-semibold text-gray-900 text-sm">All customers</p>
              <p className="text-xs text-gray-500">Active customer accounts</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTarget('USER')}
            className={cn(
              'flex items-center gap-3 rounded-2xl border p-4 text-left transition-colors',
              target === 'USER'
                ? 'border-brand-300 bg-brand-50'
                : 'border-gray-200 bg-white hover:border-brand-300'
            )}
          >
            <UserIcon className={cn('h-5 w-5', target === 'USER' ? 'text-brand-500' : 'text-gray-500')} />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Specific customer</p>
              <p className="text-xs text-gray-500">Send to one person</p>
            </div>
          </button>
        </div>

        {target === 'USER' && (
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or mobile…"
                value={userQuery}
                onChange={(e) => { setUserQuery(e.target.value); setSelectedUser(null); }}
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            {selectedUser ? (
              <div className="flex items-center justify-between rounded-xl bg-brand-50 border border-brand-100 px-3 py-2">
                <div>
                  <p className="text-sm font-semibold text-brand-800">{selectedUser.name ?? '—'}</p>
                  <p className="text-xs font-mono text-brand-600">{selectedUser.mobile}</p>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-semibold text-brand-700 hover:underline"
                >
                  Change
                </button>
              </div>
            ) : (
              userQuery.length >= 2 && searchResults && searchResults.users.length > 0 && (
                <ul className="divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white max-h-48 overflow-y-auto">
                  {searchResults.users.map((u) => (
                    <li key={u.id}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <span className="text-sm text-gray-900">{u.name ?? '—'}</span>
                        <span className="text-xs font-mono text-gray-500">{u.mobile}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}

        <Input
          label="Title"
          placeholder="e.g. Weekend offer"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea
            rows={4}
            placeholder="Up to 200 characters works best"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <Button className="w-full" loading={loading} onClick={submit}>
          <Send className="h-4 w-4" /> Send notification
        </Button>
      </div>
    </div>
  );
}

interface HistoryItem {
  key: string;
  title: string;
  body: string;
  firstSentAt: string;
  recipients: number;
}

function HistoryTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSWR<{ items: HistoryItem[]; pagination: Pagination }>(
    `/notifications/admin/history?page=${page}`,
    fetcher,
    { refreshInterval: 30000 }
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <History className="h-3.5 w-3.5" /> Promotional notifications sent from admin
      </div>

      {isLoading ? (
        <Skeleton className="h-40 rounded-2xl" />
      ) : items.length === 0 ? (
        <EmptyState title="No history" description="Notifications you send will appear here." />
      ) : (
        <div className="rounded-2xl bg-white border border-gray-100 divide-y divide-gray-50">
          {items.map((it) => (
            <div key={it.key} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{it.title}</p>
                  <p className="text-sm text-gray-600 mt-0.5">{it.body}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold text-brand-600">{it.recipients} sent</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(it.firstSentAt)}</p>
                </div>
              </div>
            </div>
          ))}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-gray-500">{pagination.total} broadcasts</p>
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
