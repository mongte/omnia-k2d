import { useState, useCallback } from 'react';

export interface CrawlingUrl {
  id: string;
  url: string;
  status: 'pending' | 'crawling' | 'completed' | 'error';
}

export interface ProductResult {
  id: string;
  url: string;
  title: string;
  price: string;
  rating: string;
  reviewCount: string;
  seller: string;
  thumbnail: string;
}

export interface Progress {
  current: number;
  total: number;
  currentUrl: string;
}

export const useMainPage = () => {
  const [urls, setUrls] = useState<CrawlingUrl[]>([]);
  const [crawlingUrls, setCrawlingUrls] = useState<CrawlingUrl[]>([]);
  const [progress, setProgress] = useState<Progress>({ current: 0, total: 0, currentUrl: '' });
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<ProductResult[]>([]);

  const handleAddUrls = useCallback((newUrls: string[]) => {
    const urlObjects: CrawlingUrl[] = newUrls.map((url, index) => ({
      id: `url-${Date.now()}-${index}`,
      url,
      status: 'pending'
    }));
    
    setUrls(prev => [...prev, ...urlObjects]);
  }, []);

  const simulateCrawling = async (urlList: CrawlingUrl[]) => {
    setIsRunning(true);
    setCrawlingUrls(urlList);
    setProgress({ current: 0, total: urlList.length, currentUrl: '' });

    for (let i = 0; i < urlList.length; i++) {
      const currentUrl = urlList[i];
      
      // Update current crawling status
      setProgress(prev => ({ 
        ...prev, 
        current: i + 1, 
        currentUrl: currentUrl.url 
      }));
      
      // Update URL status to crawling
      setCrawlingUrls(prev => 
        prev.map(url => 
          url.id === currentUrl.id 
            ? { ...url, status: 'crawling' as const }
            : url
        )
      );

      // Simulate crawling delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Generate mock result
      const mockResult: ProductResult = {
        id: currentUrl.id,
        url: currentUrl.url,
        title: `샘플 상품 ${i + 1}`,
        price: `${(Math.random() * 100000 + 10000).toLocaleString()}원`,
        rating: (Math.random() * 2 + 3).toFixed(1),
        reviewCount: Math.floor(Math.random() * 1000).toString(),
        seller: `판매자${i + 1}`,
        thumbnail: '/placeholder-image.jpg'
      };

      setResults(prev => [...prev, mockResult]);

      // Update URL status to completed
      setCrawlingUrls(prev => 
        prev.map(url => 
          url.id === currentUrl.id 
            ? { ...url, status: 'completed' as const }
            : url
        )
      );
    }

    setIsRunning(false);
  };

  const handleStartCrawling = useCallback(() => {
    const pendingUrls = urls.filter(url => url.status === 'pending');
    if (pendingUrls.length > 0) {
      simulateCrawling(pendingUrls);
    }
  }, [urls]);

  const handleExportExcel = useCallback(() => {
    console.log('Excel 내보내기:', results);
    // TODO: 실제 Excel 내보내기 구현
    alert('Excel 파일이 다운로드됩니다. (시뮬레이션)');
  }, [results]);

  return {
    urls,
    crawlingUrls,
    progress,
    isRunning,
    results,
    handleAddUrls,
    handleStartCrawling,
    handleExportExcel
  };
}; 