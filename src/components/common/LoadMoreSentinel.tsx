'use client';
import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';

interface Props {
  /** Fired when the sentinel scrolls into view OR the Load more button is clicked. */
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  totalShown: number;
  totalItems: number;
  /** Extra px below the viewport at which to pre-trigger. Default 200. */
  rootMargin?: string;
  /** Render a Load More button alongside the observer (default true).
   * The button is essential for users who tab through with keyboard or
   * who reach the end after a filter change with no scroll. */
  showButton?: boolean;
}

/**
 * Intersection-observer pager. Self-fires `onLoadMore` when the sentinel
 * comes into view; also exposes a Load more button as a keyboard/manual
 * fallback. Renders a `No more products.` line at the end.
 */
export function LoadMoreSentinel({
  onLoadMore, hasMore, isLoadingMore, totalShown, totalItems,
  rootMargin = '0px 0px 200px 0px', showButton = true,
}: Props) {
  const t = useTranslations();
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isLoadingMore) onLoadMore();
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore, rootMargin]);

  return (
    <div ref={ref} className="flex flex-col items-center gap-2 py-4">
      {hasMore ? (
        <>
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-gray-300 border-t-brand-500 animate-spin" />
              {t('common.loading')}
            </div>
          )}
          {showButton && !isLoadingMore && (
            <Button size="sm" variant="secondary" onClick={onLoadMore}>
              {t('products.loadMore')}
            </Button>
          )}
        </>
      ) : (
        <p className="text-[11px] text-gray-400">
          {totalItems > 0
            ? t('products.endOfList', { count: totalShown })
            : null}
        </p>
      )}
    </div>
  );
}
