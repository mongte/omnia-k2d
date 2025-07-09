import { NextRequest, NextResponse } from 'next/server';
import { CrawlRequest, CrawlResponse } from '@entities/product';
import { CrawlingService } from '@features/crawling/lib/crawling-service';

// 🚀 크롤링 API 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const crawlRequest: CrawlRequest = await request.json();
    
    // 🌐 크롤링 서비스 인스턴스 생성
    const crawlingService = new CrawlingService();
    
    // 🚀 크롤링 실행
    const response: CrawlResponse = await crawlingService.crawlUrls(crawlRequest);
    
    return NextResponse.json(response);

  } catch (error) {
    console.error('크롤링 API 에러:', error);
    
    const errorResponse: CrawlResponse = {
      success: false,
      products: [],
      errors: [error instanceof Error ? error.message : String(error)],
    };
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 