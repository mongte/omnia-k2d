'use client';

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
import {
  Clock,
  Download,
  ExternalLink,
  FileText,
  Play,
  Settings
} from 'lucide-react';
import { useState } from 'react';

// Mock 데이터
const mockProductData = [
  {
    id: 1,
    dateAdded: '2024-01-15',
    brandName: 'ソニー',
    brandNameKr: '소니',
    productName: 'ワイヤレスヘッドホン WH-1000XM5',
    productNameKr: '무선 헤드폰 WH-1000XM5',
    price: '¥39,800',
    shipping: '¥500',
    customsFee: '¥2,000',
    reviewCount: 1247,
    productUrl: 'https://www.qoo10.jp/g/123456789'
  },
  {
    id: 2,
    dateAdded: '2024-01-15',
    brandName: 'ニンテンドー',
    brandNameKr: '닌텐도',
    productName: 'Nintendo Switch OLED モデル',
    productNameKr: '닌텐도 스위치 OLED 모델',
    price: '¥37,980',
    shipping: '¥800',
    customsFee: '¥1,800',
    reviewCount: 892,
    productUrl: 'https://www.qoo10.jp/g/987654321'
  },
  {
    id: 3,
    dateAdded: '2024-01-14',
    brandName: 'アップル',
    brandNameKr: '애플',
    productName: 'iPhone 15 Pro 128GB',
    productNameKr: '아이폰 15 프로 128GB',
    price: '¥159,800',
    shipping: '무료',
    customsFee: '¥8,000',
    reviewCount: 2156,
    productUrl: 'https://www.qoo10.jp/g/456789123'
  },
  {
    id: 4,
    dateAdded: '2024-01-14',
    brandName: 'サムスン',
    brandNameKr: '삼성',
    productName: 'Galaxy S24 Ultra 256GB',
    productNameKr: '갤럭시 S24 울트라 256GB',
    price: '¥149,800',
    shipping: '¥600',
    customsFee: '¥7,500',
    reviewCount: 1834,
    productUrl: 'https://www.qoo10.jp/g/789123456'
  }
];

const logMessages = [
  '2024-01-15 14:30:25 - 크롤링 시작',
  '2024-01-15 14:30:26 - https://www.qoo10.jp/shopastamall 접속 중...',
  '2024-01-15 14:30:28 - 상품 목록 페이지 로딩 완료',
  '2024-01-15 14:30:30 - 상품 정보 수집 중... (1/50)',
  '2024-01-15 14:30:32 - 상품 정보 수집 중... (5/50)',
  '2024-01-15 14:30:35 - 상품 정보 수집 중... (10/50)',
  '2024-01-15 14:30:38 - 브랜드 정보 번역 중...',
  '2024-01-15 14:30:40 - 상품명 번역 중...',
  '2024-01-15 14:30:42 - 가격 정보 수집 완료',
  '2024-01-15 14:30:44 - 리뷰 수 집계 완료'
];

export const MainPage = () => {
  const [keyword, setKeyword] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>(logMessages.slice(0, 3));
  const [products, setProducts] = useState(mockProductData);

  const handleStartCrawling = async () => {
    setIsRunning(true);
    setProgress(0);
    setLogs([]);
    
    for (let i = 0; i < logMessages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setLogs(prev => [...prev, logMessages[i]]);
      setProgress((i + 1) / logMessages.length * 100);
    }
    
    setIsRunning(false);
  };

  const exportToExcel = () => {
    alert('Excel 파일로 내보내기 (구현 예정)');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Qoo10 상품 정보 크롤링</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Settings className="w-4 h-4 mr-2" />
              설정
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <FileText className="w-4 h-4 mr-2" />
              매뉴얼
            </Button>
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
              <Button variant="outline" align="start" className="text-sm">
                작성 설정
              </Button>
              <Button variant="outline" align="start" className="text-sm">
                선별 설정
              </Button>
              <Button variant="outline" align="start" className="text-sm">
                조건화
              </Button>
              <Button 
                onClick={handleStartCrawling}
                disabled={isRunning}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                {isRunning ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    실행 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    추가
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
                  <Label htmlFor="keyword" className="text-sm font-medium mb-2 block">
                    키워드 입력:
                  </Label>
                  <Input
                    id="keyword"
                    placeholder="검색할 키워드를 입력하세요"
                    value={keyword}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKeyword(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">카테고리:</Label>
                  <Input placeholder="전자제품" className="w-full" />
                </div>
              </div>
              
              <div className="pt-2">
                <Label className="text-sm font-medium mb-3 block">추출 시작</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" className="text-sm">추가</Button>
                  <Button variant="outline" size="sm" className="text-sm">조회</Button>
                </div>
              </div>

              {isRunning && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border">
                  <div className="flex justify-between text-sm mb-2">
                    <span>진행률</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
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
                  {logs.length === 0 ? (
                    <p className="text-gray-500">로그가 없습니다.</p>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-gray-700 leading-relaxed">
                        {log}
                      </div>
                    ))
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
                  총 {products.length}개 상품
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
                    <TableHead className="w-12 text-center">번호</TableHead>
                    <TableHead className="min-w-[80px]">날내일</TableHead>
                    <TableHead className="min-w-[80px]">브랜드명</TableHead>
                    <TableHead className="min-w-[100px]">브랜드명(번역)</TableHead>
                    <TableHead className="min-w-[200px]">상품명</TableHead>
                    <TableHead className="min-w-[200px]">상품명(번역)</TableHead>
                    <TableHead className="min-w-[80px]">판매가격</TableHead>
                    <TableHead className="min-w-[70px]">배송비</TableHead>
                    <TableHead className="min-w-[80px]">관세건수</TableHead>
                    <TableHead className="min-w-[70px]">리뷰개수</TableHead>
                    <TableHead className="w-12">상품 Url</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-center">{product.id}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {product.dateAdded}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        {product.brandName}
                      </TableCell>
                      <TableCell className="text-blue-600 text-sm">
                        {product.brandNameKr}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-sm" title={product.productName}>
                          {product.productName}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="truncate text-blue-600 text-sm" title={product.productNameKr}>
                          {product.productNameKr}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600 text-sm">
                        {product.price}
                      </TableCell>
                      <TableCell className="text-orange-600 text-sm">
                        {product.shipping}
                      </TableCell>
                      <TableCell className="text-red-600 text-sm">
                        {product.customsFee}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {product.reviewCount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <a 
                          href={product.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
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