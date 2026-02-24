import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { filterOutliers, calculateStats } from '@/utils/priceFilter';

// 스크래핑할 페이지 수를 1로 고정하여 현재 시점의 데이터만 가져옵니다 (서버 부하 감소 및 1회 스냅샷용)
const MAX_PAGES = 1;

export const maxDuration = 60; // 초 단위

interface BarotemRow {
  unit_price?: string;
  reg_date?: string;
}

interface BarotemResponse {
  code?: number;
  rows?: BarotemRow[];
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const premiumPrices: number[] = [];
    const commonPrices: number[] = [];

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'Referer': 'https://www.barotem.com/product/lists/2382r902?page=1&sell=sell'
    };

    const processRow = (item: BarotemRow, isPremium: boolean) => {
      // 이제 reg_date를 통한 시간대 그룹은 사용하지 않고, 
      // 크롤러가 도는 현재 시간 전체의 평균(스냅샷)으로만 활용합니다.
      if (item.unit_price) {
        const match = item.unit_price.match(/만당\s*([\d,]+(?:원)?)/);
        if (match && match[1]) {
          const priceStr = match[1].replace(/,/g, '').replace(/원/g, '');
          const price = parseInt(priceStr, 10);
          
          if (!isNaN(price)) {
            if (isPremium) premiumPrices.push(price);
            else commonPrices.push(price);
          }
        }
      }
    };

    // 프리미엄 리스트 (1페이지만 확보)
    try {
      const pmUrl = `https://www.barotem.com/product/premiumTable/2382r902?page=1&sell=sell`;
      const pmRes = await axios.get<BarotemResponse>(pmUrl, { headers });
      if (pmRes.data.rows && pmRes.data.rows.length > 0) {
        pmRes.data.rows.forEach(item => processRow(item, true));
      }
    } catch (e) {
      console.warn(`Premium List Page 1 Crawl Error:`, e);
    }
    
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 일반 리스트 수집 (1페이지, 최신순 orderby=1)
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const url = `https://www.barotem.com/product/productTable/2382r902?page=${page}&sell=sell&orderby=1`;
        const response = await axios.get<BarotemResponse>(url, { headers });
        if (response.data.rows && response.data.rows.length > 0) {
          response.data.rows.forEach(item => processRow(item, false));
        }
      } catch (e) {
        console.warn(`Common List Page ${page} Crawl Error:`, e);
      }
    }

    // 통계 산출
    const { averagePrice: pAvg, minPrice: pMin, maxPrice: pMax } = calculateStats(filterOutliers(premiumPrices));
    const { averagePrice: cAvg, minPrice: cMin, maxPrice: cMax } = calculateStats(filterOutliers(commonPrices));
    
    const allPrices = [...premiumPrices, ...commonPrices];
    const { averagePrice: aAvg, minPrice: aMin, maxPrice: aMax } = calculateStats(filterOutliers(allPrices));

    // 유효한 데이터가 수집되었는지 확인 (스냅샷 1회 삽입)
    // crawled_at을 생략하면 Supabase 데이터베이스 차원에서 now() 기본값이 들어갑니다.
    if (aAvg > 0) {
      const { error } = await supabase.from('crawled_data').insert([
        { list_type: 'PREMIUM', average_price: pAvg || 0, min_price: pMin, max_price: pMax },
        { list_type: 'COMMON', average_price: cAvg || 0, min_price: cMin, max_price: cMax },
        { list_type: 'ALL', average_price: aAvg || 0, min_price: aMin, max_price: aMax },
      ]);

      if (error) {
        throw new Error(`DB Insert Error: ${error.message}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      stats: { all: aAvg, premium: pAvg, common: cAvg },
      counts: { premium: premiumPrices.length, common: commonPrices.length }
    });

  } catch (error) {
    const err = error as Error;
    console.error('Crawl Error:', err.message);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
