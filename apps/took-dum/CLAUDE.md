# Project Name: Simple Touch Gym Logger (가칭)

## 1. Project Overview
- **Goal**: 텍스트 입력 없이 터치와 슬라이더만으로 운동을 기록하는 모바일 웹뷰 기반 헬스 앱.
- **Key Experience**: "Body Part -> Exercise -> Weight -> Reps -> Performance" 순서로 이어지는 Step-by-Step 인터페이스.
- **Target Platform**: Mobile Web (Next.js PWA concept), wrapped in WebView later.

## 2. Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (Dark/Light mode 필수)
- **UI Components**: Shadcn/UI (Slider, Drawer, Card 사용 권장), Lucide React (아이콘)
- **Animation**: Framer Motion (단계 전환 시 부드러운 애니메이션 필수)
- **Backend/DB**: Supabase (Auth, PostgreSQL)
- **State Management**: Zustand (단계별 입력 데이터 임시 저장용)

## 3. Core Logic & UX Flow (Very Important)
운동 기록은 하나의 거대한 Form이 아니라, 단계별 Wizard UI로 구성됩니다.

### Step 1: Body Part Selection (Grid View)
- [가슴, 등, 하체, 어깨, 팔, 복근, 유산소] 아이콘 그리드 노출.
- 선택 시 Step 2로 슬라이드 이동.

### Step 2: Exercise Selection (List View)
- Step 1에서 선택한 부위에 해당하는 운동 리스트 노출 (DB fetch).
- 아이콘(Placeholder) + 운동명 표시.
- 선택 시 Step 3로 이동.

### Step 3: Weight Input (Coarse to Fine) - *Key Feature*
- **Phase A (Coarse)**: 10kg 단위의 버튼 그리드 노출 (0, 10, 20, 30 ... 100kg).
- 유저가 '20kg'를 터치하면.
- **Phase B (Fine)**: 화면 하단에 Slider가 등장하거나 모달이 뜸.
    - Slider의 기준값(Default): 선택한 20kg.
    - Slider의 범위(Range): 15kg ~ 25kg (±5kg).
    - Slider 조작 후 '다음' 버튼 터치 시 Step 4로 이동.

### Step 4: Reps Input (Coarse to Fine)
- **Phase A (Coarse)**: 6회 단위의 버튼 그리드 노출 (6, 12, 18, 24...).
- 유저가 '12회'를 터치하면.
- **Phase B (Fine)**: Slider 등장.
    - Slider 기준값: 12회.
    - Slider 범위: 9회 ~ 15회 (±3회).
    - '다음' 버튼 터치 시 Step 5로 이동.

### Step 5: Performance Rating (RPE)
- "오늘 운동 어땠나요?" 문구.
- 0% ~ 100% Slider 제공 (Default 80%).
    - 0%: 너무 가벼움 / 100%: 실패지점 도달(너무 무거움).
- '기록 완료' 버튼 누르면 Supabase에 저장하고 메인으로 복귀.

## 4. Database Schema (Supabase)

### Table: `exercises`
- `id` (uuid, PK)
- `name` (text): 운동명 (예: 덤벨 컬)
- `body_part` (text): 부위 (예: 팔)
- `icon_slug` (text): 아이콘 매핑용 식별자 (리소스 없으므로 일단 텍스트나 기본 아이콘 사용)

### Table: `workout_logs`
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users)
- `exercise_id` (uuid, FK to exercises)
- `weight` (float): 기록한 무게
- `reps` (int): 기록한 횟수
- `performance_score` (int): 0-100 퍼포먼스 점수
- `created_at` (timestamptz): 기록 시간

## 5. UI/Design Requirements
- **Mobile First**: 모바일 웹뷰 환경을 가정하여 버튼 크기는 손가락 터치하기 편하게 큼직하게(Min-height 48px).
- **Dark Mode**: 시스템 설정에 따라 반응하되, 헬스장 분위기에 맞춰 기본적으로 다크 모드가 어울리는 UI 테마 구성.
- **Placeholder Icons**: 실제 리소스가 없으므로 `Lucide-react`의 기본 아이콘(Dumbbell, Activity 등)을 임시로 매핑하여 사용.