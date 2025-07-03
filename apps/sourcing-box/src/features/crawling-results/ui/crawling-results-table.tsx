"use client"

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Badge,
  Button
} from '@omnia-k2d/shadcn-ui'
import { Download, ExternalLink, Package } from 'lucide-react'
import { CrawlingResult } from '@/entities/product'

interface CrawlingResultsTableProps {
  results: CrawlingResult[]
  onExport?: () => void
  isExporting?: boolean
}

export const CrawlingResultsTable = ({ 
  results, 
  onExport, 
  isExporting = false 
}: CrawlingResultsTableProps) => {
  if (results.length === 0) return null

  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW'
    }).format(price)
  }

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            크롤링 결과 ({results.length}개)
          </CardTitle>
          {onExport && (
            <Button
              onClick={onExport}
              disabled={isExporting}
              size="sm"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              {isExporting ? '내보내는 중...' : '엑셀 다운로드'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">번호</TableHead>
                <TableHead>상품명</TableHead>
                <TableHead className="w-32">브랜드</TableHead>
                <TableHead className="w-24">가격</TableHead>
                <TableHead className="w-20">할인율</TableHead>
                <TableHead className="w-24">평점</TableHead>
                <TableHead className="w-20">리뷰수</TableHead>
                <TableHead className="w-20">상태</TableHead>
                <TableHead className="w-32">크롤링 시간</TableHead>
                <TableHead className="w-20">링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={result.id}>
                  <TableCell className="font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <p className="font-medium line-clamp-2">
                        {result.productName || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground">
                      {result.brand || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(result.price)}
                  </TableCell>
                  <TableCell>
                    {result.discountRate ? (
                      <Badge variant="secondary">
                        {result.discountRate}%
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">
                        {result.rating || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {result.reviewCount ? result.reviewCount.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                    >
                      {result.status === 'success' ? '성공' : '실패'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDate(result.crawledAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                      className="h-8 w-8 p-0"
                    >
                      <a 
                        href={result.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label="원본 페이지 열기"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 