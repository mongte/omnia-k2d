import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { Product, CrawlStatus, CrawlRequest } from '@entities/product'

// URL 정규화 및 중복 제거 유틸리티 함수
const normalizeAndDeduplicateUrls = (urls: string[]): string[] => {
  // shop 이름을 추출하는 함수
  const extractShopName = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathname = urlObj.pathname
      
      // /shop/shopname 패턴에서 shopname 추출
      const shopMatch = pathname.match(/\/shop\/([^/]+)/)
      if (shopMatch) {
        return shopMatch[1]
      }
      
      // /g/shopname 패턴도 지원 (일부 qoo10 URL에서 사용)
      const gMatch = pathname.match(/\/g\/([^/]+)/)
      if (gMatch) {
        return gMatch[1]
      }
      
      return null
    } catch (error) {
      console.warn('URL 파싱 실패:', url, error)
      return null
    }
  }

  // URL 정규화 (www.qoo10.jp -> m.qoo10.jp 우선)
  const normalizeUrl = (url: string): string => {
    try {
      const urlObj = new URL(url)
      
      // 데스크톱 도메인을 모바일 도메인으로 변경
      if (urlObj.hostname.startsWith('www.')) {
        urlObj.hostname = urlObj.hostname.replace('www.', 'm.')
      }
      
      return urlObj.toString()
    } catch (error) {
      console.warn('URL 정규화 실패:', url, error)
      return url
    }
  }

  console.log('🔧 normalizeAndDeduplicateUrls - 입력 URLs:', JSON.stringify(urls))

  // 먼저 모든 URL을 디코딩하고 정리
  const cleanedUrls = urls.map(url => {
    let cleanUrl = url.trim()
    try {
      // URL 디코딩 (%20 같은 인코딩된 문자 처리)
      cleanUrl = decodeURIComponent(cleanUrl)
      cleanUrl = cleanUrl.trim() // 디코딩 후 다시 trim
    } catch (error) {
      console.warn('URL 디코딩 실패, 원본 사용:', cleanUrl, error)
    }
    return cleanUrl
  }).filter(url => url.length > 0)

  console.log('🔧 정리된 URLs:', JSON.stringify(cleanedUrls))

  // shop 이름별로 URL 그룹화
  const shopGroups = new Map<string, string[]>()
  const urlsWithoutShop: string[] = []

  cleanedUrls.forEach(url => {
    const shopName = extractShopName(url)
    
    if (shopName) {
      if (!shopGroups.has(shopName)) {
        shopGroups.set(shopName, [])
      }
      const group = shopGroups.get(shopName)
      if (group) {
        group.push(url)
      }
    } else {
      // shop이 감지되지 않은 URL은 그대로 유지
      urlsWithoutShop.push(url)
    }
  })

  console.log('🔧 Shop 그룹화 결과:', Object.fromEntries(shopGroups))
  console.log('🔧 Shop이 없는 URLs:', urlsWithoutShop)

  // 각 shop 그룹에서 하나의 URL만 선택 (모바일 버전 우선)
  const deduplicatedUrls: string[] = []

  shopGroups.forEach((groupUrls, shopName) => {
    // 모바일 버전이 있으면 우선 선택
    const mobileUrl = groupUrls.find(url => url.includes('m.qoo10'))
    
    if (mobileUrl) {
      deduplicatedUrls.push(normalizeUrl(mobileUrl))
      console.log(`🔧 Shop "${shopName}": 모바일 버전 선택 - ${mobileUrl}`)
    } else {
      // 모바일 버전이 없으면 데스크톱 버전을 정규화해서 추가
      const firstUrl = groupUrls[0]
      const normalized = normalizeUrl(firstUrl)
      deduplicatedUrls.push(normalized)
      console.log(`🔧 Shop "${shopName}": 데스크톱 버전 정규화 - ${firstUrl} -> ${normalized}`)
    }
  })

  // shop이 감지되지 않은 URL들도 정규화해서 추가 (www -> m)
  urlsWithoutShop.forEach(url => {
    const normalized = normalizeUrl(url)
    deduplicatedUrls.push(normalized)
    console.log(`🔧 Shop 미감지 URL 정규화 (www->m): ${url} -> ${normalized}`)
  })

  // 최종 중복 제거 (혹시 동일한 URL이 생성된 경우)
  const uniqueUrls = Array.from(new Set(deduplicatedUrls))
  
  console.log('🔧 normalizeAndDeduplicateUrls - 최종 결과:', JSON.stringify(uniqueUrls))
  return uniqueUrls
}

interface UrlInputState {
  urls: string[]
  isValidating: boolean
  errors: Record<number, string>
  productsPerUrl: number // 각 URL당 추출할 상품 개수
  
  // Textarea 방식을 위한 상태
  inputMode: 'individual' | 'bulk' // 입력 모드
  bulkUrls: string // textarea 내용
  bulkErrors: string[] // bulk 모드 에러들
  
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
  setProductsPerUrl: (count: number) => void
  getCrawlRequest: () => CrawlRequest
  
  // Bulk mode actions
  setInputMode: (mode: 'individual' | 'bulk') => void
  setBulkUrls: (urls: string) => void
  validateBulkUrls: () => void
  parseBulkUrls: () => string[]
  
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
      productsPerUrl: 5, // 기본값을 5로 변경
      
      // Textarea 방식을 위한 상태 초기값
      inputMode: 'individual',
      bulkUrls: '',
      bulkErrors: [],

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
          // URL 디코딩 처리
          let cleanUrl = url.trim()
          try {
            cleanUrl = decodeURIComponent(cleanUrl)
            cleanUrl = cleanUrl.trim()
          } catch (error) {
            // 디코딩 실패 시 원본 사용
            console.warn('URL 디코딩 실패, 원본 사용:', cleanUrl, error)
          }
          
          const newUrls = [...state.urls]
          newUrls[index] = cleanUrl
          
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
        // URL 디코딩 처리
        let cleanUrl = url.trim()
        try {
          cleanUrl = decodeURIComponent(cleanUrl)
          cleanUrl = cleanUrl.trim()
        } catch (error) {
          console.warn('Validation 중 URL 디코딩 실패:', cleanUrl, error)
        }
        
        const urlPattern = /^https?:\/\/.+/
        const qoo10Pattern = /qoo10\.(jp|co\.kr|sg)/
        
        let error = ''
        
        if (!cleanUrl) {
          error = 'URL을 입력해주세요'
        } else if (!urlPattern.test(cleanUrl)) {
          error = '올바른 URL 형식이 아닙니다'
        } else if (!qoo10Pattern.test(cleanUrl)) {
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

      setProductsPerUrl: (count: number) => {
        set({ productsPerUrl: count })
      },

      getCrawlRequest: () => {
        const { inputMode, productsPerUrl, getValidUrls, parseBulkUrls } = get()
        console.log('🚀 getCrawlRequest - inputMode:', inputMode)
        
        let urls: string[] = []
        
        if (inputMode === 'individual') {
          const rawUrls = getValidUrls()
          console.log('🚀 getCrawlRequest - rawUrls from individual:', JSON.stringify(rawUrls))
          
          // 먼저 콤마 분리 처리
          const expandedUrls: string[] = []
          rawUrls.forEach(url => {
            if (url.includes(',')) {
              // 콤마가 포함된 경우 분리하고 디코딩
              const splitUrls = url.split(',').map(u => {
                let cleanU = u.trim()
                try {
                  cleanU = decodeURIComponent(cleanU)
                  cleanU = cleanU.trim()
                } catch (error) {
                  console.warn('개별 모드에서 URL 디코딩 실패:', cleanU, error)
                }
                return cleanU
              }).filter(u => u.length > 0)
              expandedUrls.push(...splitUrls)
            } else {
              // 단일 URL도 디코딩 처리
              let cleanUrl = url.trim()
              try {
                cleanUrl = decodeURIComponent(cleanUrl)
                cleanUrl = cleanUrl.trim()
              } catch (error) {
                console.warn('개별 모드에서 단일 URL 디코딩 실패:', cleanUrl, error)
              }
              expandedUrls.push(cleanUrl)
            }
          })
          
          console.log('🚀 getCrawlRequest - expandedUrls:', JSON.stringify(expandedUrls))
          
          // 그 다음에 정규화 및 중복 제거
          urls = normalizeAndDeduplicateUrls(expandedUrls)
        } else {
          // 일괄 입력 모드에서는 parseBulkUrls에서 이미 정규화됨
          urls = parseBulkUrls()
        }
        
        console.log('🚀 getCrawlRequest - 최종 URLs:', JSON.stringify(urls))
        
        const request = {
          urls: urls,
          productsPerUrl: productsPerUrl
        }
        console.log('🚀 getCrawlRequest - 최종 request:', JSON.stringify(request))
        
        return request
      },

      // Bulk mode actions
      setInputMode: (mode: 'individual' | 'bulk') => {
        set({ inputMode: mode })
      },
      setBulkUrls: (urls: string) => {
        // 입력된 전체 텍스트에 대해 URL 디코딩 시도
        let cleanUrls = urls
        try {
          cleanUrls = decodeURIComponent(urls)
        } catch (error) {
          // 디코딩 실패 시 원본 사용
          console.warn('Bulk URLs 디코딩 실패, 원본 사용:', error)
        }
        
        set({ bulkUrls: cleanUrls, bulkErrors: [] }) // 입력 시 에러 초기화
      },
      validateBulkUrls: () => {
        const { bulkUrls } = get()
        const urls = bulkUrls.split(',').map(url => {
          let cleanUrl = url.trim()
          try {
            // URL 디코딩
            cleanUrl = decodeURIComponent(cleanUrl)
            cleanUrl = cleanUrl.trim()
          } catch (error) {
            console.warn('Validation 중 URL 디코딩 실패:', cleanUrl, error)
          }
          return cleanUrl
        }).filter(url => url)
        const errors: string[] = []
        
        if (urls.length === 0) {
          errors.push('최소 하나의 URL을 입력해주세요')
        } else {
          urls.forEach((url, index) => {
            if (!/^https?:\/\/.+/.test(url)) {
              errors.push(`URL ${index + 1}: "${url}" - 올바른 URL 형식이 아닙니다`)
            } else if (!/qoo10\.(jp|co\.kr|sg)/.test(url)) {
              errors.push(`URL ${index + 1}: "${url}" - Qoo10 사이트 URL만 지원합니다`)
            }
          })
        }
        
        set({ bulkErrors: errors })
      },
      parseBulkUrls: () => {
        const { bulkUrls } = get()
        console.log('🔍 parseBulkUrls - 원본 bulkUrls:', JSON.stringify(bulkUrls))
        
        if (!bulkUrls || !bulkUrls.trim()) {
          console.log('🔍 parseBulkUrls - 빈 문자열이므로 빈 배열 반환')
          return []
        }
        
        // 콤마로 분리하고 각 URL을 정리 (URL 디코딩 포함)
        const urls = bulkUrls
          .split(',')
          .map(url => {
            let cleanUrl = url.trim()
            try {
              // URL 디코딩 (%20 같은 인코딩된 문자 처리)
              cleanUrl = decodeURIComponent(cleanUrl)
              cleanUrl = cleanUrl.trim() // 디코딩 후 다시 trim
            } catch (error) {
              console.warn('URL 디코딩 실패, 원본 사용:', cleanUrl, error)
            }
            return cleanUrl
          })
          .filter(url => url.length > 0)
        
        console.log('🔍 parseBulkUrls - 분리된 URLs:', JSON.stringify(urls))
        
        // URL 정규화 및 중복 제거
        const normalizedUrls = normalizeAndDeduplicateUrls(urls)
        console.log('🔍 parseBulkUrls - 정규화된 URLs:', JSON.stringify(normalizedUrls))
        
        return normalizedUrls
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