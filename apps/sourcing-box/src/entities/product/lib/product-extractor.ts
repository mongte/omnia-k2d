import { cleanText } from '@shared/lib/crawling/utils';
import * as cheerio from 'cheerio';
import { Product, RawProductData } from '../model/types';
import { extractBrandName, parseDiscountRate, parsePrice, parseSalesCount } from './data-parser';

// 📦 메인 상품 추출 함수
export const extractProductsFromMainRanking = async ($: cheerio.CheerioAPI, limit = 5): Promise<Product[]> => {
  const products: Product[] = [];
  // 직접적으로 고정 선택자 사용
  const productElements = $(`.main_ranking #ul_minishop_ranking > li`);

  // 상품이 없으면 빈 배열 반환
  if (productElements.length === 0) {
    // await saveHtmlToResource($().html() ?? '', 'main_ranking');
    console.log('상품 요소를 찾을 수 없습니다.');
    return products;
  }

  // 지정된 개수만큼 추출
  productElements.slice(0, limit).each((index, element) => {
    try {
      const $element = $(element);
      // 상품 정보 추출
      const rawData = extractProductData($element);

      if (rawData.title && rawData.price) {
        const product: Product = {
          rank: rawData.rank, // 임시 ID
          dateAdded: new Date().toISOString().split('T')[0],
          brandName: rawData.shop || extractBrandName(rawData.title), // 추출한 브랜드명 사용
          brandNameKr: '(번역 필요)', // 추후 번역 API 연동
          productName: rawData.title,
          productNameKr: '(번역 필요)', // 추후 번역 API 연동
          price: parsePrice(rawData.price),
          originalPrice: parsePrice(rawData.originalPrice),
          discountRate: rawData.discountRate || 0,
          salesCount: rawData.salesCount || 0,
          reviewCount: 0,
          productUrl: rawData.url,
          imageUrl: rawData.image,
        };

        products.push(product);
      } else {
        console.log(`상품 ${index + 1} 추출 실패: title 또는 price가 없음`);
        console.log(`  - title: ${rawData.title}`);
        console.log(`  - price: ${rawData.price}`);
        console.log(`  - image: ${rawData.image}`);
      }
    } catch (error) {
      console.error(`상품 ${index + 1} 추출 실패:`, error);
    }
  });

  return products;
};

// 🏷️ 개별 상품 데이터 추출 함수
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const extractProductData = ($element: cheerio.Cheerio<any>): RawProductData => {
  // Qoo10 실제 구조에 맞춘 정확한 추출

  const rankElement = $element.find('.rank_wrap .rank_num');
  const rank = rankElement.length > 0 ? parseInt(cleanText(rankElement.text()), 10) : 0;
  
  // 브랜드명 추출 (실제 구조: .text_brand)
  const brandElement = $element.find('.text_brand');
  const brand = brandElement.length > 0 ? cleanText(brandElement.text()) : '';

  // 상품명 추출 (실제 구조: .text_item)
  const titleElement = $element.find('.text_item');
  let title = titleElement.length > 0 ? cleanText(titleElement.text()) : '';
  
  // 상품명이 없으면 alt 속성에서 추출
  if (!title) {
    const img = $element.find('img.thumb').first();
    title = img.attr('alt') || '';
  }

  // 판매 개수 추출 (실제 구조: .option_text에서 "販売XXX個" 패턴)
  const optionElement$ = $element.find('.text_option .option_text');
  let salesCount = 0;
  if (optionElement$.length > 0) {
    const salesText = optionElement$.text()?.trim();
    salesCount = parseSalesCount(salesText);
  }

  const $textPriceElement = $element.find('.text_price');
  const priceWrapElement$ = $textPriceElement.find('.price_wrap');
  const originalPriceElement$ = priceWrapElement$.find('.price_original');
  
  // 원가 추출 (항상 시도)
  let originalPrice = '';
  if (originalPriceElement$.length > 0) {
    originalPrice = originalPriceElement$.text()?.trim().replace(/[^\d,]/g, '');
  }

  // 할인율 추출 (실제 구조: .price_percent)
  const discountElement$ = priceWrapElement$.find('.price_percent');
  const discountRate = discountElement$.length > 0 ? parseDiscountRate(discountElement$.text()?.trim()) : 0;
  
  const salePriceElement$ = $textPriceElement.find('.price_sale');
  
  // 판매가 추출 (할인가가 있으면 할인가, 없으면 원가)
  let price = '';
  if (salePriceElement$.length > 0) {
    // 할인가가 있으면 할인가 사용
    price = salePriceElement$.text()?.trim().replace(/[^\d,]/g, '');
  } else if (originalPrice) {
    // 할인가가 없으면 원가 사용
    price = originalPrice;
  }

  // URL 추출 (실제 구조: a 태그의 href)
  let url = '';
  const linkElement = $element.find('a[href*="goodscode"]').first();
  if (linkElement.length > 0) {
    url = linkElement.attr('href') || '';
    // 상대 경로인 경우 절대 경로로 변환
    if (url && !url.startsWith('http')) {
      url = `https://m.qoo10.jp${url}`;
    }
  }

  // 이미지 URL 추출 (실제 구조: img.thumb)
  const imgElement = $element.find('.img_wrap img.thumb').first();
  const image = imgElement.attr('gd_src') || '';

  return {
    rank,
    title: cleanText(title),
    price: price ? `¥${price}` : '',
    originalPrice: originalPrice ? `¥${originalPrice}` : '',
    image,
    url,
    shop: brand, // 브랜드명을 shop 필드에 저장
    discountRate,
    salesCount,
  };
};

// ⭐ 개별 상품 페이지에서 리뷰 수 추출 함수 (모바일 버전)
export const extractReviewCountFromProductPage = ($: cheerio.CheerioAPI): number => {
  try {
    // 1. JavaScript 변수에서 리뷰 수 추출 (모바일 버전)
    const scriptContent = $('script').text();
    const reviewMatch = scriptContent.match(/review_cnt=(\d+)/);
    
    if (reviewMatch) {
      const reviewCount = parseInt(reviewMatch[1], 10);
      console.log(`✅ JavaScript 변수에서 리뷰 수 추출 성공: ${reviewCount}`);
      return reviewCount;
    }

    // 2. 데스크톱 버전 선택자도 시도 (fallback)
    const reviewElement = $('.reviewRateWrap .rateTotal > span');
    
    if (reviewElement.length > 0) {
      const reviewText = cleanText(reviewElement.text());
      console.log(`📊 리뷰 텍스트 발견: "${reviewText}"`);
      
      // 숫자만 추출 (예: "1,234" -> 1234)
      const reviewMatch = reviewText.match(/[\d,]+/);
      if (reviewMatch) {
        const reviewCount = parseInt(reviewMatch[0].replace(/,/g, ''), 10);
        console.log(`✅ HTML 요소에서 리뷰 수 추출 성공: ${reviewCount}`);
        return reviewCount;
      }
    }

    // 3. 모바일 버전의 다른 패턴들 시도
    const patterns = [
      /review_count["\s]*[:=]["\s]*(\d+)/i,
      /"review_cnt"["\s]*[:=]["\s]*(\d+)/i,
      /REVIEW_CNT["\s]*[:=]["\s]*(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = scriptContent.match(pattern);
      if (match) {
        const reviewCount = parseInt(match[1], 10);
        console.log(`✅ 패턴 매칭으로 리뷰 수 추출 성공: ${reviewCount}`);
        return reviewCount;
      }
    }
    
    console.log('❌ 리뷰 수를 찾을 수 없음');
    return 0;
    
  } catch (error) {
    console.error('❌ 리뷰 수 추출 중 오류:', error);
    return 0;
  }
}; 