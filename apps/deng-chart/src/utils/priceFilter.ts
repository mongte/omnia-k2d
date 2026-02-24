/**
 * 가격 배열에서 비상식적으로 낮거나 높은 가격을 이상치로 간주하여 필터링합니다.
 */
export function filterOutliers(prices: number[]): number[] {
  if (prices.length === 0) return [];
  
  // 1. 초기 절대 하한선 필터링 (터무니없이 낮은 쓰레기값 제거, 예: 100원, 200원)
  const reasonablePrices = prices.filter(p => p > 1000); 

  if (reasonablePrices.length <= 2) return reasonablePrices; // 값이 너무 적으면 그대로 반환

  // 오름차순 정렬
  const sorted = [...reasonablePrices].sort((a, b) => a - b);
  
  // 중앙값(Median) 계산
  const midPoint = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[midPoint - 1] + sorted[midPoint]) / 2
    : sorted[midPoint];

  // 하위/상위 30% 이상 벗어나는 값을 이상치로 보고 제거 (조건은 유저 요구사항에 맞춰 조절 가능)
  // 예: "다수의 평균 시세보다 너무 낮은 가격은 제외 해야해"
  // 여기서는 중앙값의 60% 미만이거나 150%를 초과하는 값을 컷 필터링.
  const lowerBound = median * 0.6;
  const upperBound = median * 1.5;

  return sorted.filter(p => p >= lowerBound && p <= upperBound);
}

export function calculateStats(prices: number[]) {
  if (prices.length === 0) {
    return { averagePrice: 0, minPrice: null, maxPrice: null };
  }
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const averagePrice = Math.round(prices.reduce((acc, cur) => acc + cur, 0) / prices.length);
  
  return { averagePrice, minPrice, maxPrice };
}
