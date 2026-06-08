'use client';
import useSWRInfinite, { SWRInfiniteKeyLoader } from 'swr/infinite';
import { useMemo } from 'react';
import api from '@/lib/api';
import { Product } from '@/types';

interface PaginationPayload {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface PageData {
  products: Product[];
  pagination: PaginationPayload;
  matchedVariantId?: string | null;
}

const fetcher = (url: string) => api.get(url).then((r) => r.data.data as PageData);

interface Params {
  /** Build the URL for a given 1-based page; return `null` to disable fetching. */
  buildUrl: (page: number) => string | null;
  pageSize?: number;
}

/**
 * Customer-facing infinite product loader.
 *
 * Wraps `useSWRInfinite` and returns the flattened item list plus the standard
 * load-more controls. Pagination is server-side — the hook trusts the
 * backend's `hasNextPage` to decide whether another page should be fetched.
 *
 * The caller is responsible for re-keying when filters change — return a new
 * URL from `buildUrl` and SWR drops cached pages automatically.
 */
export function useInfiniteProducts({ buildUrl, pageSize = 20 }: Params) {
  const getKey: SWRInfiniteKeyLoader<PageData> = (index, previous) => {
    if (previous && !previous.pagination.hasNextPage) return null;
    return buildUrl(index + 1);
  };

  const { data, size, setSize, isLoading, isValidating, mutate } = useSWRInfinite<PageData>(
    getKey,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateOnFocus: false,
      // Persist scroll-trigger fetches across cache windows.
      parallel: false,
    },
  );

  const pages = data ?? [];
  const items = useMemo(() => pages.flatMap((p) => p.products), [pages]);

  const lastPage = pages[pages.length - 1];
  const hasMore = lastPage ? lastPage.pagination.hasNextPage : true;
  const totalItems = lastPage?.pagination.totalItems ?? 0;

  // SWR sets `isValidating` while ANY page is in flight; combine with
  // `isLoading` (initial fetch) and a flag for >first-page fetches so the UI
  // can render a different "loading more" indicator at the bottom.
  const isLoadingMore =
    size > 0 && typeof data?.[size - 1] === 'undefined' && !isLoading;

  return {
    items,
    pages,
    totalItems,
    pageSize,
    isLoading,
    isLoadingMore,
    isRefreshing: isValidating && !isLoading && !isLoadingMore,
    hasMore,
    loadMore: () => setSize(size + 1),
    setSize,
    mutate,
  };
}
