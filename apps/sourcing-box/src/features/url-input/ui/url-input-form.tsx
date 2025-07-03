"use client"

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@omnia-k2d/shadcn-ui'
import { Plus, Trash2, Zap } from 'lucide-react'
import { useUrlInputStore } from '../model/store'

interface UrlInputFormProps {
  onSubmit: (urls: string[]) => void
  isLoading?: boolean
}

export const UrlInputForm = ({ onSubmit, isLoading = false }: UrlInputFormProps) => {
  const {
    urls,
    errors,
    addUrl,
    removeUrl,
    updateUrl,
    validateUrl,
    clearAll,
    getValidUrls
  } = useUrlInputStore()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all URLs first
    urls.forEach((url, index) => {
      if (url.trim()) {
        validateUrl(index, url)
      }
    })

    const validUrls = getValidUrls()
    if (validUrls.length > 0 && Object.keys(errors).length === 0) {
      onSubmit(validUrls)
    }
  }

  const handleUrlChange = (index: number, value: string) => {
    updateUrl(index, value)
  }

  const handleUrlBlur = (index: number, value: string) => {
    validateUrl(index, value)
  }

  const canAddMore = urls.length < 10
  const hasValidUrls = getValidUrls().length > 0

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

          <div className="flex flex-wrap gap-2 pt-4">
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
            
            <Button
              type="submit"
              disabled={!hasValidUrls || isLoading || Object.keys(errors).length > 0}
              className="gap-2 ml-auto"
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