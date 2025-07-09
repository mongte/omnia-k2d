# 📦 Sourcing Box - 웹 크롤링 아키텍처

## 🏗️ 리팩토링된 구조

### 📁 파일 구조
```
src/
├── shared/lib/crawling/           # 공통 크롤링 유틸리티
│   └── utils.ts                   # 랜덤 유틸리티, 딜레이, fetchHtml, 파일저장 등
├── entities/product/lib/          # 상품 관련 비즈니스 로직
│   ├── data-parser.ts             # 데이터 변환 유틸리티
│   ├── product-extractor.ts       # 상품 데이터 추출 로직
│   └── index.ts                   # 통합 export
├── features/crawling/lib/         # 크롤링 기능 모듈
│   ├── crawling-service.ts        # 메인 크롤링 서비스
│   └── index.ts                   # 통합 export
└── app/api/crawl/route.ts         # 간단한 API 엔드포인트
```

## 🔧 주요 모듈 설명

### 1. 🛠️ `shared/lib/crawling/utils.ts`
- `getRandomElement()`: 배열에서 랜덤 요소 선택
- `randomDelay()`: 랜덤 딜레이
- `fetchHtml()`: axios 기반 HTML 요청 (재시도/딜레이 내장)
- `saveHtmlToResource()`: HTML 파일 저장
- `cleanText()`: 텍스트 정리 함수

### 2. 📊 `entities/product/lib/data-parser.ts`
- `parsePrice()`: 가격 텍스트 파싱
- `parseReviewCount()`: 리뷰 수 추출
- `parseSalesCount()`: 판매 수량 추출
- `parseDiscountRate()`: 할인율 추출

### 3. 🏷️ `entities/product/lib/product-extractor.ts`
- `extractProductsFromMainRanking()`: 메인 랭킹 상품 추출
- `extractProductData()`: 상품 상세 데이터 추출
- `extractReviewCountFromProductPage()`: 리뷰 수 추출

### 4. 🌐 `features/crawling/lib/crawling-service.ts`
- Cheerio + fetchHtml 기반 크롤링 서비스
- 메인 랭킹/상세 페이지 순차 크롤링 및 데이터 가공

---

## ✅ 현재 구조는 puppeteer/브라우저 없이 axios+cheerio만 사용합니다.
- 빠르고 가볍게 대량 크롤링 가능
- 동적 JS 렌더링이 꼭 필요한 경우에만 puppeteer 등 도입 고려

## 🔄 사용 방법

### 기본 사용법
```typescript
import { CrawlingService } from '@features/crawling/lib';

const service = new CrawlingService();
const result = await service.crawlUrls({
  urls: ['https://m.qoo10.jp/shop/example']
});
```

### 개별 모듈 사용
```typescript
// 브라우저 관리자 직접 사용
import { BrowserManager } from '@shared/lib/crawling';

const browserManager = new BrowserManager();
await browserManager.initialize();
const page = browserManager.getPage();

// 데이터 파싱 유틸리티 사용
import { parsePrice, parseSalesCount } from '@entities/product/lib';

const price = parsePrice('¥1,500');
const sales = parseSalesCount('販売127個');
```

## 🎯 장점

### 1. **관심사 분리**
- 각 모듈이 명확한 역할을 가짐
- 테스트 및 유지보수가 용이

### 2. **재사용성**
- 개별 모듈을 독립적으로 사용 가능
- 다른 크롤링 프로젝트에 재활용 가능

### 3. **확장성**
- 새로운 사이트 지원 시 extractor만 추가
- 새로운 브라우저 설정 시 config만 수정

### 4. **테스트 용이성**
- 각 함수를 독립적으로 테스트 가능
- Mock 데이터로 단위 테스트 가능

### 5. **코드 가독성**
- 각 파일이 하나의 역할에 집중
- 함수명과 구조가 명확

## 🔧 확장 가능성

### 새로운 사이트 추가
```typescript
// entities/product/lib/amazon-extractor.ts
export const extractAmazonProducts = ($: CheerioAPI) => {
  // Amazon 특화 로직
};
```

### 새로운 브라우저 설정
```typescript
// shared/lib/crawling/desktop-config.ts
export const getDesktopConfig = () => {
  // 데스크톱 브라우저 설정
};
```

### 새로운 데이터 파서
```typescript
// entities/product/lib/currency-parser.ts
export const convertCurrency = (price: string, from: string, to: string) => {
  // 환율 변환 로직
};
```

## 📈 성능 최적화

- 불필요한 리소스 차단 (이미지, CSS, 폰트)
- 랜덤 딜레이로 서버 부하 분산
- 브라우저 인스턴스 재사용
- 메모리 누수 방지를 위한 리소스 정리

## 🛡️ 보안 고려사항

- 봇 탐지 회피를 위한 다층 스텔스 설정
- 실제 브라우저 특성 시뮬레이션
- 랜덤 User-Agent 및 헤더 사용
- 자연스러운 사용자 행동 패턴 모방

---

이 구조는 Feature-Sliced Design 원칙을 따르며, 확장 가능하고 유지보수가 쉬운 크롤링 시스템을 제공합니다. 