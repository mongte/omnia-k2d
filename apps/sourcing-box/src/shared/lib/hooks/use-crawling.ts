import { useMutation } from '@tanstack/react-query';
import { CrawlRequest, CrawlResponse } from '@entities/product';
import { useUrlInputStore } from '@features/url-input/model/store';

interface CrawlMutationData {
  urls: string[];
}

export const useCrawling = () => {
  const {
    setCrawlStatus,
    setCrawledProducts,
    addCrawlError,
    addCrawlLog,
    clearCrawlData,
    resetCrawlStatus
  } = useUrlInputStore();

  const mutation = useMutation<CrawlResponse, Error, CrawlMutationData>({
    mutationFn: async ({ urls }: CrawlMutationData) => {
      const request: CrawlRequest = { urls };
      
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return response.json();
    },
    
    onMutate: ({ urls }) => {
      // 크롤링 시작 시 상태 초기화
      clearCrawlData();
      setCrawlStatus({
        isRunning: true,
        progress: 0,
        currentUrl: urls[0] || '',
        completedUrls: 0,
        totalUrls: urls.length,
      });
      addCrawlLog('크롤링을 시작합니다...');
    },

    onSuccess: (data: CrawlResponse) => {
      // 크롤링 성공
      if (data.success) {
        setCrawledProducts(data.products);
        addCrawlLog(`크롤링 완료! 총 ${data.products.length}개의 상품을 수집했습니다.`);
        
        // 에러가 있다면 로그에 추가
        if (data.errors && data.errors.length > 0) {
          data.errors.forEach(error => {
            addCrawlError(error);
            addCrawlLog(`오류: ${error}`);
          });
        }
      } else {
        addCrawlError('크롤링에 실패했습니다.');
        addCrawlLog('크롤링 실패');
      }

      // 크롤링 완료 상태 설정
      setCrawlStatus({
        isRunning: false,
        progress: 100,
        completedUrls: mutation.variables?.urls.length || 0,
      });
    },

    onError: (error: Error) => {
      // 크롤링 에러
      const errorMessage = error.message || '알 수 없는 오류가 발생했습니다.';
      addCrawlError(errorMessage);
      addCrawlLog(`크롤링 실패: ${errorMessage}`);
      
      // 에러 상태 설정
      setCrawlStatus({
        isRunning: false,
        progress: 0,
      });
    },

    onSettled: () => {
      // 크롤링 완료 후 정리
      setTimeout(() => {
        resetCrawlStatus();
      }, 2000); // 2초 후 상태 리셋
    },
  });

  // 크롤링 시작 함수
  const startCrawling = (urls: string[]) => {
    if (urls.length === 0) {
      addCrawlError('유효한 URL이 없습니다.');
      return;
    }

    addCrawlLog(`${urls.length}개의 URL을 크롤링 합니다.`);
    urls.forEach((url, index) => {
      addCrawlLog(`${index + 1}. ${url}`);
    });

    mutation.mutate({ urls });
  };

  return {
    startCrawling,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}; 