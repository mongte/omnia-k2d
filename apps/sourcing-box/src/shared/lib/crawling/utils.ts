import { promises as fs } from 'fs';
import path from 'path';
import axios from 'axios';

// 🎲 랜덤 선택 헬퍼 함수
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// ⏰ 랜덤 딜레이 함수 (사람처럼 행동)
export const randomDelay = (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * HTML을 받아오는 fetch 함수 (재시도/랜덤 딜레이 포함)
 * @param url 요청할 URL
 * @param maxRetries 최대 재시도 횟수 (기본 3)
 * @param timeoutMs 타임아웃(ms, 기본 15000)
 */
export const fetchHtml = async (
  url: string,
  maxRetries = 3,
  timeoutMs = 15000
): Promise<string> => {
  // URL이 모바일 버전인지 확인
  const isMobileUrl = url.includes('m.') || url.includes('/m/') || url.includes('mobile');
  
  // User-Agent 선택
  const userAgent = isMobileUrl
    ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36';

  let lastError;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: timeoutMs,
        headers: {
          'User-Agent': userAgent,
          'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        responseType: 'text',
        validateStatus: (status: number) => status < 500, // 4xx는 통과, 5xx만 throw
      });
      return response.data;
    } catch (err: unknown) {
      lastError = err;
      if (attempt < maxRetries) {
        await randomDelay(1000, 5000);
        continue;
      }
      throw err;
    }
  }
  throw lastError;
};

// 🧹 텍스트 정리 함수
export const cleanText = (text: string): string => {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').replace(/\u00A0/g, ' ').trim();
};

/**
 * HTML을 resource 폴더에 저장하는 범용 함수
 * @param html 저장할 HTML 문자열
 * @param product { rank?: number, productName?: string } (파일명 생성용)
 * @param resourceDir 저장 폴더 (기본값: test/html)
 */
export const saveHtmlToResource = async (
  html: string,
  name: string,
  resourceDir: string = path.resolve(process.cwd(), 'test/html')
) => {
  try {
    await fs.mkdir(resourceDir, { recursive: true });
    const safeName = name;
    const filePath = path.join(resourceDir, `${safeName}.html`);
    await fs.writeFile(filePath, html, 'utf8');
    console.log(`📝 HTML 저장 완료: ${filePath}`);
  } catch (fileErr) {
    console.error('❌ HTML 저장 실패:', fileErr);
  }
}; 