import { CrawlRequest, CrawlResponse, Product } from '@entities/product';
import { extractProductsFromMainRanking, extractReviewCountFromProductPage } from '@entities/product/lib/product-extractor';
import { fetchHtml, randomDelay } from '@shared/lib/crawling/utils';
import * as cheerio from 'cheerio';

// 🌐 크롤링 서비스 클래스 (Cheerio-only)
export class CrawlingService {
  // 🚀 메인 크롤링 실행 함수
  async crawlUrls(request: CrawlRequest): Promise<CrawlResponse> {
    const { urls, productsPerUrl = 5 } = request;
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new Error('URLs are required');
    }

    const allProducts: Product[] = [];
    const errors: string[] = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      try {
        console.log(`🕵️‍♂️ 1단계 크롤링 시작 (${i + 1}/${urls.length}): ${url}`);
        // HTML 받아오기 (재시도/딜레이 내장)
        const html = await fetchHtml(url, 3, 15000);
        const $ = cheerio.load(html);
        // main_ranking 영역에서 상품 추출 (지정된 개수만큼)
        const products = await extractProductsFromMainRanking($, productsPerUrl);
        console.log(`📦 1단계에서 추출된 상품 수: ${products.length}`);
        // 🌟 2단계: 각 상품의 리뷰 수 크롤링
        const productsWithReviews = await this.enrichProductsWithReviews(products);
        allProducts.push(...productsWithReviews);
        // 요청 간 랜덤 딜레이 (서버 과부하 방지 & 자연스러운 간격)
        if (i < urls.length - 1) {
          const delayTime = Math.floor(Math.random() * 5000) + 3000; // 3-8초 랜덤
          console.log(`⏰ 다음 요청까지 ${delayTime}ms 대기...`);
          await new Promise(resolve => setTimeout(resolve, delayTime));
        }
      } catch (error) {
        const errorMessage = `${url} 크롤링 실패: ${error instanceof Error ? error.message : String(error)}`;
        console.error(errorMessage);
        errors.push(errorMessage);
      }
    }

    return {
      success: allProducts.length > 0,
      products: allProducts,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  // ⭐ 2단계: 상품들에 리뷰 수 정보 추가 (Cheerio-only)
  private async enrichProductsWithReviews(products: Product[]): Promise<Product[]> {
    const enrichedProducts: Product[] = [];
    console.log(`🌟 2단계 크롤링 시작: ${products.length}개 상품의 리뷰 수 수집`);
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        if (product.productUrl && product.productUrl.trim() !== '') {
          console.log(`⭐ 상품 ${i + 1}/${products.length} 리뷰 크롤링: ${product.productName}, url:${product.productUrl}`);
          // 상품 상세 페이지 HTML 받아오기
          const html = await fetchHtml(product.productUrl, 3, 15000);
          const $ = cheerio.load(html);
          // 리뷰 수 추출
          const reviewCount = extractReviewCountFromProductPage($);
          const enrichedProduct: Product = {
            ...product,
            reviewCount: reviewCount
          };
          enrichedProducts.push(enrichedProduct);
          console.log(`✅ 상품 "${product.productName}" 리뷰 수: ${reviewCount}`);
          // 요청 간 딜레이 (서버 부하 방지)
          if (i < products.length - 1) {
            await randomDelay(1500, 3500);
          }
        } else {
          console.log(`⚠️ 상품 "${product.productName}" URL이 없어 리뷰 크롤링 건너뜀`);
          enrichedProducts.push(product);
        }
      } catch (error) {
        console.error(`❌ 상품 "${product.productName}" 리뷰 크롤링 실패:`, error);
        enrichedProducts.push(product);
      }
    }
    console.log(`🎉 2단계 크롤링 완료: ${enrichedProducts.length}개 상품 처리`);
    return enrichedProducts;
  }
} 