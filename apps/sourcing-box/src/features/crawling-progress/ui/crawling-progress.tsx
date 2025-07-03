"use client"

import { Card, CardContent, CardHeader, CardTitle, Progress } from '@omnia-k2d/shadcn-ui'
import { Activity, Clock } from 'lucide-react'

interface CrawlingProgressProps {
  current: number
  total: number
  currentUrl?: string
  isActive: boolean
}

export const CrawlingProgress = ({ 
  current, 
  total, 
  currentUrl, 
  isActive 
}: CrawlingProgressProps) => {
  const progress = total > 0 ? (current / total) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className={`w-5 h-5 ${isActive ? 'animate-pulse text-blue-500' : 'text-gray-500'}`} />
          크롤링 진행률
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>진행률</span>
            <span className="font-medium">
              {current} / {total} ({Math.round(progress)}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {isActive && currentUrl && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              현재 처리 중
            </div>
            <div className="p-2 bg-muted rounded text-sm font-mono break-all">
              {currentUrl}
            </div>
          </div>
        )}

        {!isActive && current === total && total > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            크롤링이 완료되었습니다.
          </div>
        )}
      </CardContent>
    </Card>
  )
} 