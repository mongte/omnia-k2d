export interface Product {
  rank: number;
  dateAdded: string;
  brandName: string;
  brandNameKr: string;
  productName: string;
  productNameKr: string;
  price: string;
  originalPrice: string;
  discountRate: number;
  salesCount: number;
  reviewCount: number;
  productUrl: string;
  imageUrl?: string;
}

// 크롤링 관련 타입 추가
export interface CrawlRequest {
  urls: string[];
}

export interface CrawlResponse {
  success: boolean;
  products: Product[];
  errors?: string[];
}

export interface CrawlStatus {
  isRunning: boolean;
  progress: number;
  currentUrl?: string;
  completedUrls: number;
  totalUrls: number;
}

export interface RawProductData {
  rank: number;
  title: string;
  price: string;
  originalPrice: string;
  image: string;
  url: string;
  shop?: string;
  discountRate?: number;
  salesCount?: number;
}

export interface CrawlingResult {
  id: number;
  productName: string;
  brand?: string;
  price?: number;
  originalPrice?: number;
  discountRate?: number;
  salesCount?: number;
  rating?: number;
  reviewCount?: number;
  status: 'success' | 'failed';
  crawledAt: string;
  sourceUrl: string;
  productUrl?: string;
  imageUrl?: string;
} 