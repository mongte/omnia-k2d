// 🏷️ 브랜드명 추출 함수
export const extractBrandName = (productName: string): string => {
  // 간단한 브랜드명 추출 로직 (개선 가능)
  const commonBrands = ['Sony', 'Nintendo', 'Apple', 'Samsung', 'ソニー', 'ニンテンドー', 'アップル', 'サムスン'];
  
  for (const brand of commonBrands) {
    if (productName.includes(brand)) {
      return brand;
    }
  }
  
  // 첫 번째 단어를 브랜드로 가정
  const firstWord = productName.split(' ')[0];
  return firstWord || '브랜드 미상';
};

// 💰 가격 파싱 함수
export const parsePrice = (priceText: string): string => {
  if (!priceText) return '';
  
  // 다양한 가격 형식 지원
  const cleanPrice = priceText.trim();
  
  // 이미 ¥ 또는 円이 포함된 경우
  if (cleanPrice.includes('¥') || cleanPrice.includes('円') || cleanPrice.includes('￥')) {
    // 숫자와 기호만 추출하여 정리
    const match = cleanPrice.match(/[¥￥円]\s*[\d,]+|[\d,]+\s*[¥￥円]/);
    if (match) {
      const numMatch = match[0].match(/[\d,]+/);
      if (numMatch) {
        return `¥${numMatch[0]}`;
      }
    }
    return cleanPrice;
  }
  
  // 숫자만 있는 경우 ¥ 추가
  const numMatch = cleanPrice.match(/[\d,]+/);
  if (numMatch) {
    return `¥${numMatch[0]}`;
  }
  
  return cleanPrice;
};

// ⭐ 리뷰 수 파싱 함수
export const parseReviewCount = (text: string): number => {
  if (!text) return 0;
  
  // 리뷰, 평가, 후기 등의 키워드와 함께 있는 숫자 추출
  const patterns = [
    /リビュー[\s\D]*(\d+)/i,     // 일본어 리뷰
    /レビュー[\s\D]*(\d+)/i,     // 일본어 리뷰
    /評価[\s\D]*(\d+)/i,         // 일본어 평가
    /口コミ[\s\D]*(\d+)/i,       // 일본어 후기
    /리뷰[\s\D]*(\d+)/i,
    /평가[\s\D]*(\d+)/i,
    /후기[\s\D]*(\d+)/i,
    /review[\s\D]*(\d+)/i,
    /rating[\s\D]*(\d+)/i,
    /(\d+)[\s\D]*リビュー/i,     // 숫자 + 일본어 리뷰
    /(\d+)[\s\D]*レビュー/i,     // 숫자 + 일본어 리뷰
    /(\d+)[\s\D]*評価/i,         // 숫자 + 일본어 평가
    /(\d+)[\s\D]*口コミ/i,       // 숫자 + 일본어 후기
    /(\d+)[\s\D]*리뷰/i,
    /(\d+)[\s\D]*평가/i,
    /(\d+)[\s\D]*후기/i,
    /(\d+)[\s\D]*review/i,
    /\((\d+)\)/,                 // 괄호 안의 숫자
    /(\d+)개/,                   // 개수 표현
    /(\d+)건/,                   // 건수 표현
    /(\d+)件/,                   // 일본어 건수
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      if (count > 0) return count;
    }
  }
  
  // 패턴이 없으면 첫 번째 숫자 사용
  const match = text.match(/(\d+)/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return 0;
};

// 📊 판매 수량 파싱 함수 (일본어 "販売XXX個" 패턴)
export const parseSalesCount = (text: string): number => {
  if (!text) return 0;
  
  // 販売XXX個 패턴 찾기
  const salesMatch = text.match(/販売(\d+)個/);
  if (salesMatch && salesMatch[1]) {
    return parseInt(salesMatch[1], 10);
  }
  
  // 숫자만 있는 경우
  const numMatch = text.replace(/[^0-9]/g, '');
  if (numMatch) {
    return parseInt(numMatch, 10);
  }
  
  return 0;
};

// 🎯 할인율 파싱 함수
export const parseDiscountRate = (text: string): number => {
  if (!text) return 0;
  
  const discountMatch = text.match(/(\d+)%/);
  if (discountMatch && discountMatch[1]) {
    return parseInt(discountMatch[1], 10);
  }
  
  return 0;
}; 