-- =====================================================
-- Took-Dum Supabase Database Setup
-- =====================================================
-- Supabase SQL Editor에서 이 파일의 내용을 복사해서 실행하세요
-- =====================================================

-- exercises 테이블 생성
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  body_part TEXT NOT NULL,
  icon_slug TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- workout_logs 테이블 생성
CREATE TABLE IF NOT EXISTS workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NULL,  -- 인증 스킵 단계에서는 NULL 허용
  exercise_id UUID REFERENCES exercises(id),
  weight FLOAT NOT NULL,
  reps INT NOT NULL,
  performance_score INT NOT NULL CHECK (performance_score >= 0 AND performance_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (인증 구현 전에는 주석 처리)
-- 나중에 사용자 인증을 추가할 때 주석을 제거하세요
-- ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own logs" ON workout_logs
--   FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own logs" ON workout_logs
--   FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 초기 더미 데이터: 운동 목록 (7개 부위 x 5개 = 35개)
-- =====================================================

INSERT INTO exercises (name, body_part, icon_slug) VALUES
-- 가슴 (5개)
('벤치 프레스', '가슴', 'dumbbell'),
('인클라인 덤벨 프레스', '가슴', 'dumbbell'),
('딥스', '가슴', 'activity'),
('푸시업', '가슴', 'activity'),
('케이블 플라이', '가슴', 'cable'),

-- 등 (5개)
('데드리프트', '등', 'dumbbell'),
('풀업', '등', 'activity'),
('바벨 로우', '등', 'dumbbell'),
('랫 풀다운', '등', 'activity'),
('시티드 로우', '등', 'cable'),

-- 하체 (5개)
('스쿼트', '하체', 'dumbbell'),
('레그 프레스', '하체', 'activity'),
('레그 컬', '하체', 'activity'),
('레그 익스텐션', '하체', 'activity'),
('런지', '하체', 'activity'),

-- 어깨 (5개)
('숄더 프레스', '어깨', 'dumbbell'),
('사이드 레터럴 레이즈', '어깨', 'dumbbell'),
('프론트 레이즈', '어깨', 'dumbbell'),
('리어 델트 플라이', '어깨', 'dumbbell'),
('업라이트 로우', '어깨', 'dumbbell'),

-- 팔 (5개)
('바벨 컬', '팔', 'dumbbell'),
('덤벨 컬', '팔', 'dumbbell'),
('트라이셉 푸시다운', '팔', 'cable'),
('오버헤드 익스텐션', '팔', 'dumbbell'),
('해머 컬', '팔', 'dumbbell'),

-- 복근 (5개)
('크런치', '복근', 'activity'),
('레그 레이즈', '복근', 'activity'),
('플랭크', '복근', 'activity'),
('러시안 트위스트', '복근', 'activity'),
('바이시클 크런치', '복근', 'activity'),

-- 유산소 (5개)
('러닝머신', '유산소', 'activity'),
('사이클', '유산소', 'activity'),
('로잉머신', '유산소', 'activity'),
('계단 오르기', '유산소', 'activity'),
('줄넘기', '유산소', 'activity');

-- =====================================================
-- 확인 쿼리: 데이터가 잘 들어갔는지 확인
-- =====================================================
-- SELECT body_part, COUNT(*) as count FROM exercises GROUP BY body_part ORDER BY body_part;
-- SELECT * FROM exercises ORDER BY body_part, name;
