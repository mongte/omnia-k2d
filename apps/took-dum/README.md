# Took-Dum - 간편 운동 기록 앱

터치와 슬라이더만으로 운동을 기록하는 모바일 웹 헬스 앱입니다.

## 🎯 주요 기능

- **5단계 위저드 UI**: 부위 선택 → 운동 선택 → 무게 → 횟수 → 퍼포먼스
- **Coarse to Fine 입력**: 큰 단위로 빠르게 선택 후 미세 조정
- **GitHub 스타일 히트맵**: 운동 기록을 한눈에 확인
- **다크 모드**: 헬스장 분위기에 맞는 다크 테마 고정
- **모바일 최적화**: 터치 친화적인 UI/UX

## 🚀 빠른 시작

### 1. Supabase 설정

#### 1.1 환경 변수 설정

`.env.local` 파일을 생성하세요:

```bash
cp .env.local.example .env.local
```

mcp.json에서 project_ref를 확인하여 환경 변수를 설정:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gdufgtgmrqohjlvtdeib.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 1.2 데이터베이스 생성

1. [Supabase Dashboard](https://app.supabase.com)에 접속
2. 프로젝트 선택 (project_ref: gdufgtgmrqohjlvtdeib)
3. **SQL Editor** 메뉴 선택
4. `supabase-setup.sql` 파일의 내용을 복사해서 실행

이것으로 다음이 자동 생성됩니다:
- `exercises` 테이블 (운동 목록)
- `workout_logs` 테이블 (운동 기록)
- 초기 더미 데이터 (7개 부위 x 5개 = 35개 운동)

### 2. 의존성 설치 및 실행

모노레포 루트에서:

```bash
# 의존성 설치
pnpm install

# took-dum 개발 서버 실행
pnpm took-dum:dev
```

브라우저에서 `http://localhost:3004` 접속!

## 📁 프로젝트 구조 (FSD 아키텍처)

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 루트 레이아웃
│   ├── page.tsx           # 메인 페이지 (워크아웃 위저드)
│   ├── records/           # 기록 페이지
│   └── global.css         # 전역 스타일
├── features/              # 기능별 모듈
│   ├── workout-logger/   # 운동 기록 위저드
│   │   ├── ui/           # Step 1-5 컴포넌트
│   │   └── model/        # Zustand 스토어
│   └── supabase/         # Supabase 클라이언트
├── shared/               # 공유 리소스
│   └── constants/        # 상수 (부위, 무게/횟수 옵션)
└── widgets/              # 독립 위젯

```

## 🎨 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn/UI
- **Animation**: Framer Motion
- **State**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Monorepo**: Nx

## 🔥 핵심 UX 흐름

### Step 1: 부위 선택
7개 부위 그리드 (가슴, 등, 하체, 어깨, 팔, 복근, 유산소)

### Step 2: 운동 선택
Supabase에서 선택한 부위의 운동 리스트 fetch

### Step 3: 무게 입력 (Coarse to Fine)
- **Phase A**: 10kg 단위 (0, 10, 20, ..., 100kg)
- **Phase B**: 선택 후 ±5kg 슬라이더

### Step 4: 횟수 입력 (Coarse to Fine)
- **Phase A**: 6회 단위 (6, 12, 18, 24...)
- **Phase B**: 선택 후 ±3회 슬라이더

### Step 5: 퍼포먼스 평가
0-100% 슬라이더 (기본값: 80%)
- 0%: 너무 가벼움
- 100%: 실패 지점

기록 완료 후 → `/records` 페이지로 이동

## 📊 Records 페이지

- GitHub Contributions 스타일 캘린더 히트맵
- 날짜별 운동 빈도 시각화 (0회=회색 → 6+회=진한초록)
- 이번 달 통계: 총 운동 횟수, 가장 많이 한 부위
- 날짜 클릭 시 상세 기록 표시

## 🛠️ 개발 스크립트

```bash
# 개발 서버
pnpm took-dum:dev

# 프로덕션 빌드
pnpm took-dum:build

# 프로덕션 실행
pnpm took-dum:start
```

## 🔮 다음 단계

- [ ] 사용자 인증 (Supabase Auth)
- [ ] PWA 설정 (오프라인 지원)
- [ ] 운동 루틴 템플릿
- [ ] 무게/횟수 변화 추이 차트
- [ ] 운동 타이머 기능

## 📝 라이센스

MIT

---

**Made with ❤️ using Claude Code**
