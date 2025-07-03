export interface Product {
  id: string
  title: string
  price: number
  originalPrice?: number
  discountRate?: number
  imageUrl: string
  productUrl: string
  seller: string
  rating?: number
  reviewCount: number
  isGlobalShipping: boolean
  category?: string
  description?: string
  crawledAt: Date
  sourceUrl: string
}

export interface CrawlingResult {
  id: string
  sourceUrl: string
  productName?: string
  brand?: string
  price?: number
  discountRate?: number
  rating?: string
  reviewCount?: number
  status: 'success' | 'error'
  errorMessage?: string
  crawledAt: string
} 