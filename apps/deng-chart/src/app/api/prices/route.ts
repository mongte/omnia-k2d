import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: rawData, error } = await supabase
      .from('crawled_data')
      .select('*')
      .order('crawled_at', { ascending: true }); // 과거부터 최신순으로 정렬

    if (error) {
      throw error;
    }

    // 데이터를 Recharts 컴포넌트에 넘길 수 있는 시계열 형태로 변형
    // 각 시점(crawled_at)마다 프리미엄 시세와 일반 시세를 묶어 하나의 객체로 만듦
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const groupedByDate: Record<string, Record<string, any>> = {};

    rawData.forEach((row) => {
      // 시간을 표시하기 위해 포맷팅
      const dateStr = new Date(row.crawled_at).toLocaleString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      });

      if (!groupedByDate[dateStr]) {
        groupedByDate[dateStr] = {
          name: dateStr,
          timestamp: row.crawled_at,
        };
      }

      if (row.list_type === 'PREMIUM') {
        groupedByDate[dateStr].PremiumAppx = row.average_price;
        groupedByDate[dateStr].PremiumMin = row.min_price;
        groupedByDate[dateStr].PremiumMax = row.max_price;
      } else if (row.list_type === 'COMMON') {
        groupedByDate[dateStr].CommonAppx = row.average_price;
        groupedByDate[dateStr].CommonMin = row.min_price;
        groupedByDate[dateStr].CommonMax = row.max_price;
      } else if (row.list_type === 'ALL') {
         groupedByDate[dateStr].AllAppx = row.average_price;
         groupedByDate[dateStr].AllMin = row.min_price;
         groupedByDate[dateStr].AllMax = row.max_price;
      }
    });

    const chartData = Object.values(groupedByDate).sort((a, b) => 
      new Date(a.timestamp as string).getTime() - new Date(b.timestamp as string).getTime()
    );

    return NextResponse.json({ success: true, data: chartData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
