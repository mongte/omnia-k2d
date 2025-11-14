'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { useInfiniteList } from '../model/use-infinite-list';

interface Item {
  id: string;
  title: string;
  description: string;
}

// 더미 데이터 생성 함수
const generateDummyData = (page: number, pageSize: number): Item[] => {
  const start = (page - 1) * pageSize;
  return Array.from({ length: pageSize }, (_, i) => ({
    id: `item-${start + i + 1}`,
    title: `Item ${start + i + 1}`,
    description: `This is the description for item ${start + i + 1}`,
  }));
};

// 가짜 API 호출 시뮬레이션
const fetchMoreItems = async (page: number): Promise<Item[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // 1초 지연
  const maxPages = 5; // 최대 5페이지로 제한

  if (page > maxPages) {
    return [];
  }

  return generateDummyData(page, 10);
};

export function InfiniteList() {
  const initialData = generateDummyData(1, 10);
  const { items, loading, hasMore, setRef } = useInfiniteList({
    initialData,
    fetchMore: fetchMoreItems,
    pageSize: 10,
  });

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* 리스트 아이템 */}
      {items.map((item) => (
        <div
          key={item.id}
          className="p-6 rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
        >
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
      ))}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading more...</span>
        </div>
      )}

      {/* Intersection Observer 트리거 */}
      {hasMore && !loading && (
        <div ref={setRef} className="h-10 flex items-center justify-center">
          <div className="h-1 w-1 bg-transparent" />
        </div>
      )}

      {/* 더 이상 데이터가 없을 때 */}
      {!hasMore && (
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">No more items to load</p>
        </div>
      )}
    </div>
  );
}
