import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Product, CrawlStatus } from '@entities/product'

interface UrlInputState {
  urls: string[]
  isValidating: boolean
  errors: Record<number, string>
  
  // 크롤링 상태
  crawlStatus: CrawlStatus
  crawledProducts: Product[]
  crawlErrors: string[]
  crawlLogs: string[]
  
  // Actions
  addUrl: () => void
  removeUrl: (index: number) => void
  updateUrl: (index: number, url: string) => void
  setUrls: (urls: string[]) => void
  validateUrl: (index: number, url: string) => void
  clearAll: () => void
  getValidUrls: () => string[]
  
  // 크롤링 Actions
  setCrawlStatus: (status: Partial<CrawlStatus>) => void
  setCrawledProducts: (products: Product[]) => void
  addCrawlError: (error: string) => void
  addCrawlLog: (log: string) => void
  clearCrawlData: () => void
  resetCrawlStatus: () => void
}

export const useUrlInputStore = create<UrlInputState>()(
  devtools(
    (set, get) => ({
      urls: [''],
      isValidating: false,
      errors: {},
      
      // 크롤링 상태 초기값
      crawlStatus: {
        isRunning: false,
        progress: 0,
        currentUrl: '',
        completedUrls: 0,
        totalUrls: 0,
      },
      crawledProducts: [],
      crawlErrors: [],
      crawlLogs: [],

      addUrl: () => {
        set((state) => ({
          urls: [...state.urls, '']
        }))
      },

      removeUrl: (index: number) => {
        set((state) => ({
          urls: state.urls.filter((_, i) => i !== index),
          errors: Object.keys(state.errors).reduce((acc, key) => {
            const keyNum = parseInt(key)
            if (keyNum < index) {
              acc[keyNum] = state.errors[keyNum]
            } else if (keyNum > index) {
              acc[keyNum - 1] = state.errors[keyNum]
            }
            return acc
          }, {} as Record<number, string>)
        }))
      },

      updateUrl: (index: number, url: string) => {
        set((state) => {
          const newUrls = [...state.urls]
          newUrls[index] = url
          
          // Clear error for this index when user starts typing
          const newErrors = { ...state.errors }
          if (newErrors[index]) {
            delete newErrors[index]
          }
          
          return {
            urls: newUrls,
            errors: newErrors
          }
        })
      },

      setUrls: (urls: string[]) => {
        set({
          urls: urls,
          errors: {}
        })
      },

      validateUrl: (index: number, url: string) => {
        const urlPattern = /^https?:\/\/.+/
        const qoo10Pattern = /qoo10\.(jp|co\.kr|sg)/
        
        let error = ''
        
        if (!url.trim()) {
          error = 'URL을 입력해주세요'
        } else if (!urlPattern.test(url)) {
          error = '올바른 URL 형식이 아닙니다'
        } else if (!qoo10Pattern.test(url)) {
          error = 'Qoo10 사이트 URL만 지원합니다'
        }
        
        set((state) => ({
          errors: error 
            ? { ...state.errors, [index]: error }
            : Object.keys(state.errors).reduce((acc, key) => {
                if (parseInt(key) !== index) {
                  acc[parseInt(key)] = state.errors[parseInt(key)]
                }
                return acc
              }, {} as Record<number, string>)
        }))
      },

      clearAll: () => {
        set({
          urls: [''],
          errors: {}
        })
      },

      getValidUrls: () => {
        const { urls, errors } = get()
        return urls.filter((url, index) => 
          url.trim() && !errors[index]
        )
      },

      // 크롤링 Actions
      setCrawlStatus: (status: Partial<CrawlStatus>) => {
        set((state) => ({
          crawlStatus: { ...state.crawlStatus, ...status }
        }))
      },

      setCrawledProducts: (products: Product[]) => {
        set({ crawledProducts: products })
      },

      addCrawlError: (error: string) => {
        set((state) => ({
          crawlErrors: [...state.crawlErrors, error]
        }))
      },

      addCrawlLog: (log: string) => {
        set((state) => ({
          crawlLogs: [...state.crawlLogs, `${new Date().toLocaleTimeString()} - ${log}`]
        }))
      },

      clearCrawlData: () => {
        set({
          crawledProducts: [],
          crawlErrors: [],
          crawlLogs: []
        })
      },

      resetCrawlStatus: () => {
        set({
          crawlStatus: {
            isRunning: false,
            progress: 0,
            currentUrl: '',
            completedUrls: 0,
            totalUrls: 0,
          }
        })
      }
    }),
    { name: 'url-input-store' }
  )
) 