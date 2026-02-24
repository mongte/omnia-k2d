-- 1. crawled_data 테이블 생성
CREATE TABLE IF NOT EXISTS public.crawled_data (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  average_price numeric NOT NULL,
  min_price numeric,
  max_price numeric,
  crawled_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  list_type text NOT NULL -- 'PREMIUM', 'COMMON' 또는 'ALL'
);

-- 2. RLS(Row Level Security) 설정
-- 브라우저에서 차트를 볼 수 있도록 누구나 조회(Select) 가능하게 허용합니다.
ALTER TABLE public.crawled_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access"
  ON public.crawled_data
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 크롤링 로직(API Route 또는 Server Action)에서 데이터를 제한 없이 넣을 수 있도록 Insert 권한 허용
CREATE POLICY "Allow anonymous insert access"
  ON public.crawled_data
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
