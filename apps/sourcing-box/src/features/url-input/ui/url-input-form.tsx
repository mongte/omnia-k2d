"use client"

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from '@omnia-k2d/shadcn-ui'
import { Plus, Trash2, Zap, List, Edit } from 'lucide-react'
import { useUrlInputStore } from '../model/store'
import { CrawlRequest } from '@entities/product'

interface UrlInputFormProps {
  onSubmit: (request: CrawlRequest) => void
  isLoading?: boolean
}

export const UrlInputForm = ({ onSubmit, isLoading = false }: UrlInputFormProps) => {
  const {
    urls,
    errors,
    productsPerUrl,
    inputMode,
    bulkUrls,
    bulkErrors,
    addUrl,
    removeUrl,
    updateUrl,
    validateUrl,
    clearAll,
    getValidUrls,
    setProductsPerUrl,
    getCrawlRequest,
    setInputMode,
    setBulkUrls,
    validateBulkUrls,
    parseBulkUrls,
  } = useUrlInputStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (inputMode === 'individual') {
      // 개별 입력 모드
      urls.forEach((url, index) => {
        if (url.trim()) {
          validateUrl(index, url)
        }
      })

      const validUrls = getValidUrls()
      if (validUrls.length > 0 && Object.keys(errors).length === 0) {
        onSubmit(getCrawlRequest())
      }
    } else {
      // 일괄 입력 모드
      console.log('🔥 일괄 입력 모드 - bulkUrls:', JSON.stringify(bulkUrls))
      const parsedUrls = parseBulkUrls()
      console.log('🔥 일괄 입력 모드 - parsedUrls:', JSON.stringify(parsedUrls))
      
      validateBulkUrls()
      
      const validUrls = parseBulkUrls()
      console.log('🔥 일괄 입력 모드 - validUrls:', JSON.stringify(validUrls))
      if (validUrls.length > 0 && bulkErrors.length === 0) {
        onSubmit(getCrawlRequest())
      }
    }
  }

  const handleUrlChange = (index: number, value: string) => {
    updateUrl(index, value)
  }

  const handleUrlBlur = (index: number, value: string) => {
    validateUrl(index, value)
  }

  const handleProductsPerUrlChange = (value: string) => {
    const count = parseInt(value) || 1
    if (count >= 1 && count <= 50) {
      setProductsPerUrl(count)
    }
  }

  const handleBulkUrlsChange = (value: string) => {
    setBulkUrls(value)
  }

  const handleBulkUrlsBlur = () => {
    if (bulkUrls.trim()) {
      validateBulkUrls()
    }
  }

  const canAddMore = urls.length < 10
  const hasValidUrls = inputMode === 'individual' 
    ? getValidUrls().length > 0
    : parseBulkUrls().length > 0
  const hasErrors = inputMode === 'individual'
    ? Object.keys(errors).length > 0
    : bulkErrors.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>크롤링할 URL 입력</CardTitle>
        <p className="text-sm text-muted-foreground">
          Qoo10 상품 페이지 URL을 입력해주세요 (최대 10개)
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 상품 개수 설정 */}
          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
            <Label htmlFor="products-per-url" className="text-sm font-medium">
              URL당 상품 개수:
            </Label>
            <Input
              id="products-per-url"
              type="number"
              min="1"
              max="50"
              value={productsPerUrl}
              onChange={(e) => handleProductsPerUrlChange(e.target.value)}
              disabled={isLoading}
              className="w-20"
            />
            <span className="text-xs text-muted-foreground">
              (1-50개)
            </span>
          </div>

          {/* 입력 모드 선택 */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={inputMode === 'individual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('individual')}
              disabled={isLoading}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              개별 입력
            </Button>
            <Button
              type="button"
              variant={inputMode === 'bulk' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setInputMode('bulk')}
              disabled={isLoading}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              일괄 입력
            </Button>
          </div>

          {inputMode === 'individual' ? (
            // 개별 입력 모드
            <>
              {urls.map((url, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`url-${index}`} className="sr-only">
                      URL {index + 1}
                    </Label>
                    <Input
                      id={`url-${index}`}
                      type="url"
                      placeholder="https://www.qoo10.jp/g/..."
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      onBlur={(e) => handleUrlBlur(index, e.target.value)}
                      disabled={isLoading}
                      className={errors[index] ? 'border-destructive' : ''}
                    />
                    {errors[index] && (
                      <p className="text-sm text-destructive mt-1">
                        {errors[index]}
                      </p>
                    )}
                  </div>
                  
                  {urls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeUrl(index)}
                      disabled={isLoading}
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-2">
                {canAddMore && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addUrl}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    URL 추가
                  </Button>
                )}
                
                {urls.some(url => url.trim()) && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={clearAll}
                    disabled={isLoading}
                  >
                    전체 초기화
                  </Button>
                )}
              </div>
            </>
          ) : (
            // 일괄 입력 모드
            <div className="space-y-2">
              <Label htmlFor="bulk-urls" className="text-sm font-medium">
                URL 목록 (콤마로 구분)
              </Label>
              <Textarea
                id="bulk-urls"
                placeholder="https://www.qoo10.jp/g/..., https://m.qoo10.jp/shop/..., ..."
                value={bulkUrls}
                onChange={(e) => handleBulkUrlsChange(e.target.value)}
                onBlur={handleBulkUrlsBlur}
                disabled={isLoading}
                className={bulkErrors.length > 0 ? 'border-destructive' : ''}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                여러 URL을 콤마(,)로 구분하여 입력하세요
              </p>
              {bulkErrors.length > 0 && (
                <div className="space-y-1">
                  {bulkErrors.map((error, index) => (
                    <p key={index} className="text-sm text-destructive">
                      {error}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!hasValidUrls || isLoading || hasErrors}
              className="gap-2"
            >
              {isLoading ? (
                '크롤링 중...'
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  크롤링 시작
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 