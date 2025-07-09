'use client';

import { useUrlInputStore } from '@features/url-input/model/store';
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@omnia-k2d/shadcn-ui';
import { useCrawling } from '@shared/lib/hooks/use-crawling';
import {
  Clock,
  Download,
  ExternalLink,
  FileText,
  Minus,
  Play,
  Plus
} from 'lucide-react';
import Image from 'next/image';
import * as XLSX from 'xlsx';

export const MainPage = () => {
  const {
    urls,
    errors,
    crawlStatus,
    crawledProducts,
    crawlLogs,
    crawlErrors,
    addUrl,
    removeUrl,
    updateUrl,
    validateUrl,
    getValidUrls,
  } = useUrlInputStore();

  const { startCrawling, isLoading } = useCrawling();

  const handleStartCrawling = () => {
    const validUrls = getValidUrls();
    if (validUrls.length === 0) {
      alert('유효한 URL을 하나 이상 입력해주세요.');
      return;
    }
    startCrawling(validUrls);
  };

  const exportToExcel = () => {
    if (crawledProducts.length === 0) {
      alert('내보낼 데이터가 없습니다. 먼저 크롤링을 실행해주세요.');
      return;
    }

    // 주요 필드만 추출
    const data = crawledProducts.map((item) => ({
      rank: item.rank,
      dateAdded: item.dateAdded,
      brandName: item.brandName,
      productName: item.productName,
      price: item.price,
      originalPrice: item.originalPrice,
      discountRate: item.discountRate,
      salesCount: item.salesCount,
      reviewCount: item.reviewCount,
      productUrl: item.productUrl,
      imageUrl: item.imageUrl,
    }));

    // 워크북/시트 생성
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '크롤링결과');

    // 파일명: crawling_results_YYYYMMDD_HHmmss.xlsx
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const fileName = `crawling_results_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.xlsx`;

    // 워크북을 Blob으로 변환 후 다운로드
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 100);
  };

  const handleUrlChange = (index: number, value: string) => {
    updateUrl(index, value);
    if (value.trim()) {
      validateUrl(index, value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Qoo10 상품 정보 크롤링</h1>
          <div className="flex items-center gap-2">
            {/* <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <FileText className="w-4 h-4 mr-2" />
              매뉴얼
            </Button> */}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Control Panel */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">크롤링 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* <Button variant="outline" align="start" className="text-sm">
                작성 설정
              </Button>
              <Button variant="outline" align="start" className="text-sm">
                선별 설정
              </Button>
              <Button variant="outline" align="start" className="text-sm">
                조건화
              </Button> */}
              <Button 
                onClick={handleStartCrawling}
                disabled={crawlStatus.isRunning || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                {crawlStatus.isRunning || isLoading ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    크롤링 시작
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Content - 50/50 Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel - Search Form */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>검색 조건</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    크롤링 URL 목록:
                  </Label>
                  {urls.map((url, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        placeholder="https://m.qoo10.jp/shop/... URL을 입력하세요"
                        value={url}
                        onChange={(e) => handleUrlChange(index, e.target.value)}
                        className={`flex-1 ${errors[index] ? 'border-red-500' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addUrl()}
                        className="shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                      {urls.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeUrl(index)}
                          className="shrink-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {Object.entries(errors).map(([index, error]) => (
                    <p key={index} className="text-sm text-red-600 mt-1">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
              
              <div className="pt-2">
                <Label className="text-sm font-medium mb-3 block">크롤링 상태</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>입력된 URL: {urls.filter(url => url.trim()).length}개</p>
                  <p>유효한 URL: {getValidUrls().length}개</p>
                  {crawlStatus.totalUrls > 0 && (
                    <p>완료: {crawlStatus.completedUrls}/{crawlStatus.totalUrls}</p>
                  )}
                </div>
              </div>

              {(crawlStatus.isRunning || isLoading) && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                  <div className="flex justify-between text-sm mb-2">
                    <span>진행률</span>
                    <span className="font-medium">{Math.round(crawlStatus.progress)}%</span>
                  </div>
                  <Progress value={crawlStatus.progress} className="h-2" />
                  {crawlStatus.currentUrl && (
                    <p className="text-xs text-gray-600 mt-2 truncate">
                      현재: {crawlStatus.currentUrl}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel - Logs */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                로그
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 overflow-y-auto bg-gray-50 rounded-lg p-3 border">
                <div className="space-y-1 text-xs font-mono">
                  {crawlLogs.length === 0 ? (
                    <p className="text-gray-500">로그가 없습니다.</p>
                  ) : (
                    crawlLogs.map((log: string, index: number) => (
                      <div key={index} className="text-gray-700 leading-relaxed">
                        {log}
                      </div>
                    ))
                  )}
                  {crawlErrors.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <p className="text-red-600 font-semibold mb-1">오류:</p>
                      {crawlErrors.map((error: string, index: number) => (
                        <div key={index} className="text-red-600 leading-relaxed">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Table */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-lg">주문 항목</CardTitle>
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1">
                  총 {crawledProducts.length}개 상품
                </Badge>
                <Button onClick={exportToExcel} variant="outline" size="sm" className="text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  엑셀로 저장
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="w-12 text-center">rank</TableHead>
                    <TableHead className="w-20 text-center">썸네일</TableHead>
                    <TableHead className="min-w-[80px] text-center">날짜</TableHead>
                    <TableHead className="min-w-[100px] text-center">브랜드명</TableHead>
                    <TableHead className="min-w-[250px] text-center">상품명</TableHead>
                    <TableHead className="min-w-[100px] text-center">원가</TableHead>
                    <TableHead className="min-w-[100px] text-center">판매가격</TableHead>
                    <TableHead className="min-w-[80px] text-center">할인율</TableHead>
                    <TableHead className="min-w-[80px] text-center">판매량</TableHead>
                    <TableHead className="min-w-[100px] text-center">리뷰수</TableHead>
                    <TableHead className="min-w-[100px] text-center">링크</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {crawledProducts.map((product) => (
                    <TableRow key={product.rank} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-center">{product.rank}</TableCell>
                      <TableCell className="text-center">
                        {product.imageUrl ? (
                          <div className="flex justify-center">
                            <div className="relative w-12 h-12 rounded border border-gray-200 overflow-hidden">
                              <Image 
                                src={product.imageUrl} 
                                alt={product.productName}
                                fill
                                sizes="48px"
                                className="object-cover"
                                onError={() => {
                                  console.log('이미지 로딩 실패:', product.imageUrl);
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
                      <TableCell className="text-center text-sm text-gray-600">
                        {product.dateAdded}
                      </TableCell>
                      <TableCell className="text-center font-medium text-sm">
                        <div className="truncate max-w-[100px]" title={product.brandName}>
                          {product.brandName}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[250px]">
                        {product.productUrl ? (
                          <a 
                            href={product.productUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline block break-words leading-relaxed"
                            title={product.productName}
                          >
                            {product.productName}
                          </a>
                        ) : (
                          <div className="text-sm break-words leading-relaxed" title={product.productName}>
                            {product.productName}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-center font-semibold text-gray-600 text-sm">
                        <span className="whitespace-nowrap line-through">
                          {product.originalPrice}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-green-600 text-sm">
                        <span className="whitespace-nowrap">
                          {product.price}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="destructive" className="text-xs">
                          {product.discountRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="text-xs">
                          {product.salesCount.toLocaleString()}개
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="text-xs">
                          {product.reviewCount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {product.productUrl ? (
                          <a 
                            href={product.productUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-block"
                            aria-label="상품 페이지 열기"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 