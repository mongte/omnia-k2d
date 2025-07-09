"use client"

import Image from 'next/image'
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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">번호</TableHead>
                <TableHead className="w-20 text-center">썸네일</TableHead>
                <TableHead className="min-w-[250px]">상품명</TableHead>
                <TableHead className="w-24 text-center">브랜드</TableHead>
                <TableHead className="w-24 text-center">원가</TableHead>
                <TableHead className="w-24 text-center">판매가격</TableHead>
                <TableHead className="w-16 text-center">할인율</TableHead>
                <TableHead className="w-16 text-center">판매량</TableHead>
                <TableHead className="w-20 text-center">평점</TableHead>
                <TableHead className="w-16 text-center">리뷰수</TableHead>
                <TableHead className="w-16 text-center">상태</TableHead>
                <TableHead className="w-28 text-center">크롤링 시간</TableHead>
                <TableHead className="w-16 text-center">링크</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result, index) => (
                <TableRow key={result.id}>
                  <TableCell className="text-center font-medium">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-center">
                    {result.imageUrl ? (
                      <div className="flex justify-center">
                        <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden">
                          <Image 
                            src={result.imageUrl} 
                            alt={result.productName}
                            fill
                            sizes="48px"
                            className="object-cover"
                            onError={() => {
                              console.log('이미지 로딩 실패:', result.imageUrl);
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-400">NO IMG</span>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-[250px]">
                      {result.productUrl ? (
                        <a 
                          href={result.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline line-clamp-2 break-words"
                        >
                          {result.productName || '-'}
                        </a>
                      ) : (
                        <p className="font-medium line-clamp-2 break-words">
                          {result.productName || '-'}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <p className="text-sm text-muted-foreground truncate max-w-[80px]" title={result.brand}>
                      {result.brand || '-'}
                    </p>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    <span className="whitespace-nowrap line-through text-gray-500">
                      {formatPrice(result.originalPrice)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    <span className="whitespace-nowrap text-green-600">
                      {formatPrice(result.price)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.discountRate ? (
                      <Badge variant="destructive" className="text-xs">
                        {result.discountRate}%
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    {result.salesCount ? (
                      <Badge variant="outline" className="text-xs">
                        {result.salesCount.toLocaleString()}개
                      </Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">
                        {result.rating || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm text-muted-foreground">
                    {result.reviewCount ? result.reviewCount.toLocaleString() : '-'}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={result.status === 'success' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {result.status === 'success' ? '성공' : '실패'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center text-xs text-muted-foreground">
                    <span className="whitespace-nowrap">
                      {formatDate(result.crawledAt)}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {result.productUrl ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a 
                          href={result.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          aria-label="상품 페이지 열기"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    ) : '-'}
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