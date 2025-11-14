'use client';

import { useState, useEffect, useCallback } from 'react';
import { useIntersection } from '@shared/lib/hooks/use-intersection';

interface UseInfiniteListOptions<T> {
  initialData: T[];
  fetchMore: (page: number) => Promise<T[]>;
  pageSize?: number;
}

export function useInfiniteList<T>({
  initialData,
  fetchMore,
  pageSize = 10,
}: UseInfiniteListOptions<T>) {
  const [items, setItems] = useState<T[]>(initialData);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [setRef, entry] = useIntersection({
    threshold: 0.5,
    rootMargin: '100px',
  });

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const newItems = await fetchMore(page + 1);

      if (newItems.length < pageSize) {
        setHasMore(false);
      }

      setItems((prev) => [...prev, ...newItems]);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error('Failed to load more items:', error);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore, fetchMore, pageSize]);

  useEffect(() => {
    if (entry?.isIntersecting) {
      loadMore();
    }
  }, [entry?.isIntersecting, loadMore]);

  return {
    items,
    loading,
    hasMore,
    setRef,
  };
}
