"use client"

import { Badge, Card, CardContent, CardHeader, CardTitle, Button } from '@omnia-k2d/shadcn-ui'
import { Globe, X } from 'lucide-react'
import { UrlListItem } from '../index'

interface UrlListProps {
  urls: UrlListItem[]
  onRemove: (id: string) => void
}

const statusConfig = {
  pending: { label: '대기', variant: 'secondary' as const },
  crawling: { label: '크롤링 중', variant: 'default' as const },
  completed: { label: '완료', variant: 'outline' as const },
  error: { label: '오류', variant: 'destructive' as const },
}

export const UrlList = ({ urls, onRemove }: UrlListProps) => {
  if (urls.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          입력된 URL 목록 ({urls.length}개)
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {urls.map((item) => {
            const config = statusConfig[item.status]
            const canRemove = item.status === 'pending'
            
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {item.url}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant={config.variant}>
                    {config.label}
                  </Badge>
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 