export const API_ENDPOINTS = {
  CRAWL: '/api/crawl',
  EXPORT: '/api/export',
} as const

export const CRAWLING_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
} as const

export const MAX_URLS = 10

export const SUPPORTED_SITES = [
  'qoo10.jp',
  'qoo10.co.kr',
  'qoo10.sg',
] as const 