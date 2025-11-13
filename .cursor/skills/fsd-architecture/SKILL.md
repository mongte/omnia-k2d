---
name: fsd-architecture
description: Feature-Sliced Design (FSD) architecture for frontend projects. Use when creating, organizing, or refactoring frontend code structure, React components, features, entities, or pages. Use when user mentions FSD, layers, slices, or wants to organize code by features or business domains.
---

# FSD (Feature-Sliced Design) Architecture

FSD는 프론트엔드 프로젝트를 기능 중심으로 구조화하는 아키텍처입니다. 7개의 계층적 레이어로 코드를 조직하여 확장성과 유지보수성을 극대화합니다.

## 핵심 구조

### 레이어 계층 (위에서 아래로, 상위가 하위만 참조 가능)

```
app/        ← 전역 설정, 라우팅, 프로바이더
pages/      ← URL에 매핑되는 개별 페이지
widgets/    ← 독립적인 큰 UI 블록 (여러 features 조합)
features/   ← 재사용 가능한 비즈니스 기능
entities/   ← 비즈니스 핵심 데이터 모델
shared/     ← 공통 UI, 유틸리티, API 클라이언트
```

### 슬라이스와 세그먼트 (app, shared 제외)

각 레이어는 비즈니스 도메인별 **슬라이스**로 나뉘며, 각 슬라이스는 **세그먼트**로 구성됩니다:

```
features/
  follow-user/          ← 슬라이스 (비즈니스 도메인)
    model/              ← 세그먼트 (상태 관리)
    ui/                 ← 세그먼트 (UI 컴포넌트)
    api/                ← 세그먼트 (API 호출)
    lib/                ← 세그먼트 (유틸리티)
    index.ts            ← 공개 API (필수)
```

## 핵심 원칙

1. **단방향 의존성**: `app → pages → widgets → features → entities → shared` (위에서 아래로만)
2. **슬라이스 독립성**: 같은 레이어의 슬라이스끼리는 참조 불가
3. **공개 API 필수**: 모든 슬라이스는 `index.ts`를 통해서만 export

## 코드 생성 가이드

### 1. 레이어 결정

- **전체 페이지** → `pages/`
- **여러 기능의 조합** → `widgets/`
- **사용자 인터랙션 기능** (팔로우, 좋아요, 댓글) → `features/`
- **데이터 모델** (User, Post, Product) → `entities/`
- **범용 컴포넌트/유틸** → `shared/`

### 2. 기본 구조 생성

```bash
# Feature 예시
features/
  follow-user/
    model/
      useFollowUser.ts
    ui/
      FollowButton.tsx
    api/
      followApi.ts
    index.ts
```

### 3. 코드 작성 패턴

```typescript
// features/follow-user/model/useFollowUser.ts
export const useFollowUser = (userId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const toggleFollow = async () => {
    if (isFollowing) {
      await unfollowUser(userId);
    } else {
      await followUser(userId);
    }
    setIsFollowing(!isFollowing);
  };
  
  return { isFollowing, toggleFollow };
};

// features/follow-user/ui/FollowButton.tsx
import { Button } from '@/shared/ui/button';
import { useFollowUser } from '../model/useFollowUser';

export const FollowButton = ({ userId }) => {
  const { isFollowing, toggleFollow } = useFollowUser(userId);
  
  return (
    <Button onClick={toggleFollow}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

// features/follow-user/index.ts
export { FollowButton } from './ui/FollowButton';
export { useFollowUser } from './model/useFollowUser';
```

### 4. Import 규칙

```typescript
// ✅ 올바른 import (하위 레이어 참조)
import { Button } from '@/shared/ui/button';
import { User } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';

// ❌ 잘못된 import (같은 레이어 또는 상위 레이어)
import { LikeButton } from '@/features/like-post';  // features 간 참조 금지
import { HomePage } from '@/pages/home';            // 하위가 상위 참조 금지
```

## 자주 사용하는 패턴

### Pages 레이어
```typescript
// pages/profile/ui/ProfilePage.tsx
import { UserProfileWidget } from '@/widgets/user-profile';
import { UserPostsWidget } from '@/widgets/user-posts';

export const ProfilePage = () => (
  <div>
    <UserProfileWidget />
    <UserPostsWidget />
  </div>
);
```

### Widgets 레이어
```typescript
// widgets/user-profile/ui/UserProfile.tsx
import { UserCard } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';

export const UserProfile = ({ userId }) => (
  <div>
    <UserCard userId={userId} />
    <FollowButton userId={userId} />
  </div>
);
```

### Shared 레이어 (슬라이스 없음)
```
shared/
  ui/              ← Button, Input, Modal 등
  api/             ← API 클라이언트 설정
  lib/             ← 범용 유틸리티 함수
  hooks/           ← 범용 훅
  config/          ← 환경 설정
```

## 주의사항

- ❌ `features/follow-user → features/like-post` (같은 레이어 참조)
- ❌ `entities/user → features/follow-user` (하위가 상위 참조)
- ❌ 직접 경로 import: `from './ui/Button'` 대신 `from '@/features/follow-user'` 사용
- ✅ 항상 공개 API(`index.ts`)를 통해 export
- ✅ Shared는 비즈니스 로직 없이 범용적으로

## 상세 가이드

전체 레이어별 설명, 실전 예제, 안티패턴은 [guide.md](guide.md)를 참조하세요.

## 빠른 체크리스트

새로운 기능을 만들 때:

1. [ ] 어느 레이어인지 결정 (pages/widgets/features/entities/shared)
2. [ ] 슬라이스 이름 결정 (비즈니스 도메인 기준)
3. [ ] 필요한 세그먼트 생성 (model/ui/api/lib)
4. [ ] `index.ts`에 공개 API 정의
5. [ ] 의존성 규칙 준수 (상위 → 하위만)
6. [ ] 같은 레이어 슬라이스 간 참조 없는지 확인
