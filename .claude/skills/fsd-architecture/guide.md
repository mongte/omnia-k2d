# FSD (Feature-Sliced Design) 완벽 가이드

## 목차
1. [FSD 아키텍처란?](#fsd-아키텍처란)
2. [레이어 (Layers)](#레이어-layers)
3. [슬라이스 (Slices)](#슬라이스-slices)
4. [세그먼트 (Segments)](#세그먼트-segments)
5. [실전 디렉토리 구조](#실전-디렉토리-구조)
6. [레이어별 코드 작성 가이드](#레이어별-코드-작성-가이드)
7. [의존성 규칙](#의존성-규칙)
8. [공개 API 패턴](#공개-api-패턴)
9. [베스트 프랙티스](#베스트-프랙티스)
10. [안티패턴](#안티패턴)

---

## FSD 아키텍처란?

Feature-Sliced Design(FSD)은 프론트엔드 애플리케이션을 **기능 중심**으로 구조화하는 아키텍처 방법론입니다.

### 핵심 목표
- ✅ **높은 응집도**: 관련 코드를 한 곳에 모아 관리
- ✅ **낮은 결합도**: 모듈 간 의존성 최소화
- ✅ **확장성**: 새로운 기능 추가 시 기존 코드에 영향 최소화
- ✅ **유지보수성**: 코드 위치 예측 가능, 변경 영향 범위 제한

### 3단계 계층 구조
```
레이어 (Layer) → 슬라이스 (Slice) → 세그먼트 (Segment)
```

---

## 레이어 (Layers)

FSD는 7개의 표준화된 레이어로 구성되며, 각 레이어는 명확한 책임을 가집니다.

### 레이어 계층도

```
┌─────────────────────────────────────┐
│  app/     - 앱 전역 설정           │ ← 최상위
├─────────────────────────────────────┤
│  pages/   - 개별 페이지            │
├─────────────────────────────────────┤
│  widgets/ - 독립 기능 블록         │
├─────────────────────────────────────┤
│  features/ - 비즈니스 기능         │
├─────────────────────────────────────┤
│  entities/ - 비즈니스 데이터       │
├─────────────────────────────────────┤
│  shared/  - 공통 리소스            │ ← 최하위
└─────────────────────────────────────┘
```

**의존성 규칙**: 위에서 아래로만 참조 가능 (단방향)

---

### 1. App 레이어

**목적**: 애플리케이션 전역 설정 및 초기화

**포함 요소**:
- 라우팅 설정
- 전역 상태 초기화
- 글로벌 스타일
- 프로바이더 설정

**특징**: 슬라이스 없이 세그먼트만 포함

**디렉토리 구조**:
```
📂 app/
  📂 providers/        - Context Providers
  📂 styles/           - 전역 스타일
  📂 router/           - 라우팅 설정
  📄 App.tsx           - 루트 컴포넌트
  📄 index.tsx         - 앱 진입점
```

**예제**:
```typescript
// app/App.tsx
import { Router } from './router';
import { Providers } from './providers';
import './styles/global.css';

export const App = () => {
  return (
    <Providers>
      <Router />
    </Providers>
  );
};
```

---

### 2. Pages 레이어

**목적**: 특정 URL에 매핑되는 완전한 페이지 구성

**포함 요소**:
- 라우트별 최상위 컴포넌트
- 페이지 레벨 레이아웃
- SEO 메타데이터

**책임**:
- Widgets와 Features 조합
- 페이지 레벨 데이터 페칭
- URL 파라미터 처리

**디렉토리 구조**:
```
📂 pages/
  📂 home/
    📂 ui/
      📄 HomePage.tsx
    📄 index.ts
  📂 user-profile/
    📂 ui/
      📄 UserProfilePage.tsx
    📄 index.ts
  📂 settings/
    📂 ui/
      📄 SettingsPage.tsx
    📄 index.ts
```

**예제**:
```typescript
// pages/user-profile/ui/UserProfilePage.tsx
import { UserProfileWidget } from '@/widgets/user-profile';
import { UserPostsWidget } from '@/widgets/user-posts';

export const UserProfilePage = () => {
  return (
    <div className="page">
      <UserProfileWidget />
      <UserPostsWidget />
    </div>
  );
};

// pages/user-profile/index.ts
export { UserProfilePage } from './ui/UserProfilePage';
```

---

### 3. Widgets 레이어

**목적**: 독립적으로 작동하는 큰 기능 단위의 UI 블록

**특징**:
- 여러 Features와 Entities 조합
- 여러 페이지에서 재사용 가능
- 독립적인 비즈니스 컨텍스트 보유

**예시**:
- 검색바 (SearchBar)
- 대시보드 (Dashboard)
- 사이드바 메뉴 (SidebarMenu)
- 사용자 프로필 카드 (UserProfileCard)

**디렉토리 구조**:
```
📂 widgets/
  📂 user-profile/
    📂 ui/
      📄 UserProfile.tsx
    📂 model/
      📄 useUserProfile.ts
    📄 index.ts
  📂 search-bar/
    📂 ui/
      📄 SearchBar.tsx
    📂 model/
      📄 useSearch.ts
    📄 index.ts
```

**예제**:
```typescript
// widgets/user-profile/ui/UserProfile.tsx
import { UserAvatar } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';
import { EditProfileButton } from '@/features/edit-profile';

export const UserProfile = ({ userId }) => {
  return (
    <div className="user-profile">
      <UserAvatar userId={userId} />
      <FollowButton userId={userId} />
      <EditProfileButton userId={userId} />
    </div>
  );
};

// widgets/user-profile/index.ts
export { UserProfile } from './ui/UserProfile';
```

---

### 4. Features 레이어

**목적**: 재사용 가능한 비즈니스 기능 구현

**특징**:
- 사용자 인터랙션 처리
- 독립적으로 동작 가능
- 여러 페이지/위젯에서 재사용

**예시**:
- 사용자 팔로우 (FollowUser)
- 게시물 좋아요 (LikePost)
- 댓글 작성 (AddComment)
- 검색 필터 (ApplyFilter)

**디렉토리 구조**:
```
📂 features/
  📂 follow-user/
    📂 model/
      📄 useFollowUser.ts
    📂 ui/
      📄 FollowButton.tsx
    📂 api/
      📄 followApi.ts
    📄 index.ts
  📂 like-post/
    📂 model/
      📄 useLikePost.ts
    📂 ui/
      📄 LikeButton.tsx
    📂 api/
      📄 likeApi.ts
    📄 index.ts
```

**예제**:
```typescript
// features/follow-user/model/useFollowUser.ts
import { useState } from 'react';
import { followUser, unfollowUser } from '../api/followApi';

export const useFollowUser = (userId: string) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleFollow = async () => {
    setIsLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      setIsFollowing(!isFollowing);
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};

// features/follow-user/ui/FollowButton.tsx
import { Button } from '@/shared/ui/button';
import { useFollowUser } from '../model/useFollowUser';

export const FollowButton = ({ userId }) => {
  const { isFollowing, isLoading, toggleFollow } = useFollowUser(userId);
  
  return (
    <Button 
      onClick={toggleFollow} 
      disabled={isLoading}
      variant={isFollowing ? 'secondary' : 'primary'}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};

// features/follow-user/index.ts
export { FollowButton } from './ui/FollowButton';
export { useFollowUser } from './model/useFollowUser';
```

**Features 레이어가 필요한 이유**:
- 동일한 비즈니스 로직을 여러 곳에서 재사용
- 중복 코드 방지
- 기능별 독립적인 테스트 가능
- 유지보수 시 한 곳만 수정

---

### 5. Entities 레이어

**목적**: 비즈니스 핵심 데이터 모델 관리

**특징**:
- 비즈니스 엔티티 정의
- 데이터 중심 (행동보다는 상태)
- 프로젝트 전반에서 사용

**예시**:
- User (사용자)
- Post (게시물)
- Product (상품)
- Comment (댓글)

**디렉토리 구조**:
```
📂 entities/
  📂 user/
    📂 model/
      📄 types.ts
      📄 userStore.ts
    📂 ui/
      📄 UserCard.tsx
      📄 UserAvatar.tsx
    📂 api/
      📄 userApi.ts
    📂 lib/
      📄 userHelpers.ts
    📄 index.ts
  📂 post/
    📂 model/
      📄 types.ts
    📂 ui/
      📄 PostCard.tsx
    📄 index.ts
```

**예제**:
```typescript
// entities/user/model/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  followersCount: number;
  followingCount: number;
}

// entities/user/ui/UserCard.tsx
import { User } from '../model/types';

interface UserCardProps {
  user: User;
}

export const UserCard = ({ user }: UserCardProps) => {
  return (
    <div className="user-card">
      <img src={user.avatar} alt={user.name} />
      <h3>{user.name}</h3>
      <p>{user.email}</p>
      <div>
        <span>{user.followersCount} Followers</span>
        <span>{user.followingCount} Following</span>
      </div>
    </div>
  );
};

// entities/user/lib/userHelpers.ts
import { User } from '../model/types';

export const getUserDisplayName = (user: User): string => {
  return user.name || user.email.split('@')[0];
};

export const isUserVerified = (user: User): boolean => {
  return user.followersCount > 1000;
};

// entities/user/index.ts
export { UserCard } from './ui/UserCard';
export { UserAvatar } from './ui/UserAvatar';
export type { User } from './model/types';
export { getUserDisplayName, isUserVerified } from './lib/userHelpers';
```

---

### 6. Shared 레이어

**목적**: 프로젝트 전반에서 재사용되는 공통 리소스 제공

**특징**:
- 슬라이스 없음 (세그먼트만 존재)
- 비즈니스 로직 독립적
- 기술적 재사용성 중심

**디렉토리 구조**:
```
📂 shared/
  📂 ui/                - 기본 UI 컴포넌트
    📂 button/
      📄 Button.tsx
      📄 index.ts
    📂 modal/
      📄 Modal.tsx
      📄 index.ts
    📄 index.ts
  📂 api/               - API 기본 설정
    📄 axios.ts
    📄 apiClient.ts
    📄 index.ts
  📂 lib/               - 유틸리티 함수
    📄 formatDate.ts
    📄 validators.ts
    📄 index.ts
  📂 config/            - 환경 설정
    📄 env.ts
    📄 constants.ts
    📄 index.ts
  📂 types/             - 공통 타입 정의
    📄 common.ts
    📄 index.ts
  📂 hooks/             - 재사용 가능한 훅
    📄 useDebounce.ts
    📄 useLocalStorage.ts
    📄 index.ts
```

**예제**:
```typescript
// shared/ui/button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'small' | 'medium' | 'large';
  children: ReactNode;
}

export const Button = ({ 
  variant = 'primary', 
  size = 'medium',
  children,
  ...props 
}: ButtonProps) => {
  return (
    <button 
      className={`button button--${variant} button--${size}`}
      {...props}
    >
      {children}
    </button>
  );
};

// shared/ui/button/index.ts
export { Button } from './Button';

// shared/ui/index.ts
export { Button } from './button';
export { Modal } from './modal';
export { Input } from './input';

// shared/lib/formatDate.ts
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('ko-KR').format(date);
};

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return `${days}일 전`;
};

// shared/lib/index.ts
export { formatDate, formatRelativeTime } from './formatDate';
export { validateEmail, validatePassword } from './validators';

// shared/api/apiClient.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// shared/api/index.ts
export { apiClient } from './apiClient';
```

---

## 슬라이스 (Slices)

### 슬라이스란?

슬라이스는 **비즈니스 도메인별로 코드를 그룹화**하는 두 번째 계층입니다.

**핵심 개념**:
- 각 슬라이스는 하나의 비즈니스 엔티티를 나타냄
- 슬라이스는 같은 레이어 내에서 서로 참조 불가
- 프로젝트마다 슬라이스 이름은 자유롭게 정의

**예시**:
- 소셜 네트워크: `user`, `post`, `comment`, `feed`
- 쇼핑몰: `product`, `cart`, `order`, `payment`
- 대시보드: `analytics`, `reports`, `settings`, `notifications`

### 슬라이스 독립성 규칙

```
❌ 금지: 같은 레이어의 슬라이스 간 참조
features/follow-user → features/like-post  // ❌ 불가능

✅ 허용: 하위 레이어의 슬라이스 참조
features/follow-user → entities/user       // ✅ 가능
features/follow-user → shared/ui           // ✅ 가능
```

**이유**:
1. **높은 응집도**: 관련 코드가 한 슬라이스에 모임
2. **낮은 결합도**: 슬라이스 간 의존성 최소화
3. **독립적 개발**: 각 슬라이스를 독립적으로 수정 가능
4. **쉬운 삭제**: 기능 제거 시 슬라이스만 삭제

### 슬라이스 그룹화

관련 있는 슬라이스들을 그룹으로 묶을 수 있지만, 코드 참조는 여전히 불가능합니다.

```
📂 features/
  📂 (auth)/              - 그룹 표시 (선택적)
    📂 login/
    📂 register/
    📂 reset-password/
  📂 (social)/
    📂 follow-user/
    📂 share-post/
```

---

## 세그먼트 (Segments)

### 세그먼트란?

세그먼트는 **기능별로 코드를 분리**하는 세 번째 계층입니다.

### 표준 세그먼트

| 세그먼트 | 목적 | 포함 내용 |
|---------|------|-----------|
| `ui/` | 사용자 인터페이스 | 컴포넌트, 스타일 |
| `model/` | 비즈니스 로직 | 상태 관리, 훅, 유효성 검사 |
| `api/` | 백엔드 통신 | API 호출, 데이터 변환 |
| `lib/` | 유틸리티 | 헬퍼 함수, 상수 |
| `config/` | 설정 | 환경 설정, 초기값 |
| `types/` | 타입 정의 | TypeScript 인터페이스/타입 |

### 세그먼트 구조 예시

```
📂 features/
  📂 follow-user/
    📂 model/
      📄 useFollowUser.ts        - 비즈니스 로직 훅
      📄 followStore.ts          - 상태 관리
      📄 types.ts                - 타입 정의
    📂 ui/
      📄 FollowButton.tsx        - UI 컴포넌트
      📄 FollowButton.css        - 스타일
    📂 api/
      📄 followApi.ts            - API 요청
      📄 dto.ts                  - 데이터 변환
    📂 lib/
      📄 validators.ts           - 유효성 검사
      📄 constants.ts            - 상수
    📄 index.ts                  - 공개 API
```

### 커스텀 세그먼트

프로젝트 필요에 따라 커스텀 세그먼트 추가 가능:

```
📂 features/
  📂 payment/
    📂 model/
    📂 ui/
    📂 api/
    📂 validators/          - 커스텀: 결제 유효성 검사
    📂 providers/           - 커스텀: 결제 프로바이더
    📄 index.ts
```

---

## 실전 디렉토리 구조

### 소셜 네트워크 프로젝트 예시

```
📂 src/
  📂 app/
    📂 providers/
      📄 AuthProvider.tsx
      📄 ThemeProvider.tsx
    📂 router/
      📄 index.tsx
      📄 routes.tsx
    📂 styles/
      📄 global.css
      📄 theme.css
    📄 App.tsx
    📄 index.tsx

  📂 pages/
    📂 feed/
      📂 ui/
        📄 FeedPage.tsx
      📄 index.ts
    📂 profile/
      📂 ui/
        📄 ProfilePage.tsx
      📄 index.ts
    📂 settings/
      📂 ui/
        📄 SettingsPage.tsx
      📄 index.ts

  📂 widgets/
    📂 post-feed/
      📂 model/
        📄 usePostFeed.ts
      📂 ui/
        📄 PostFeed.tsx
      📄 index.ts
    📂 user-profile-header/
      📂 ui/
        📄 UserProfileHeader.tsx
      📄 index.ts
    📂 sidebar/
      📂 ui/
        📄 Sidebar.tsx
      📄 index.ts

  📂 features/
    📂 create-post/
      📂 model/
        📄 useCreatePost.ts
      📂 ui/
        📄 CreatePostForm.tsx
      📂 api/
        📄 createPostApi.ts
      📄 index.ts
    📂 like-post/
      📂 model/
        📄 useLikePost.ts
      📂 ui/
        📄 LikeButton.tsx
      📂 api/
        📄 likeApi.ts
      📄 index.ts
    📂 follow-user/
      📂 model/
        📄 useFollowUser.ts
      📂 ui/
        📄 FollowButton.tsx
      📂 api/
        📄 followApi.ts
      📄 index.ts
    📂 add-comment/
      📂 model/
        📄 useAddComment.ts
      📂 ui/
        📄 CommentForm.tsx
      📂 api/
        📄 commentApi.ts
      📄 index.ts

  📂 entities/
    📂 user/
      📂 model/
        📄 types.ts
        📄 userStore.ts
      📂 ui/
        📄 UserCard.tsx
        📄 UserAvatar.tsx
      📂 api/
        📄 userApi.ts
      📂 lib/
        📄 userHelpers.ts
      📄 index.ts
    📂 post/
      📂 model/
        📄 types.ts
        📄 postStore.ts
      📂 ui/
        📄 PostCard.tsx
      📂 api/
        📄 postApi.ts
      📄 index.ts
    📂 comment/
      📂 model/
        📄 types.ts
      📂 ui/
        📄 CommentItem.tsx
      📄 index.ts

  📂 shared/
    📂 ui/
      📂 button/
        📄 Button.tsx
        📄 index.ts
      📂 input/
        📄 Input.tsx
        📄 index.ts
      📂 modal/
        📄 Modal.tsx
        📄 index.ts
      📄 index.ts
    📂 api/
      📄 apiClient.ts
      📄 index.ts
    📂 lib/
      📄 formatDate.ts
      📄 validators.ts
      📄 index.ts
    📂 hooks/
      📄 useDebounce.ts
      📄 useLocalStorage.ts
      📄 index.ts
    📂 config/
      📄 env.ts
      📄 constants.ts
      📄 index.ts
    📂 types/
      📄 common.ts
      📄 index.ts
```

---

## 레이어별 코드 작성 가이드

### Pages 레이어 작성 패턴

```typescript
// pages/feed/ui/FeedPage.tsx
import { PostFeedWidget } from '@/widgets/post-feed';
import { CreatePostFeature } from '@/features/create-post';

export const FeedPage = () => {
  return (
    <div className="feed-page">
      <CreatePostFeature />
      <PostFeedWidget />
    </div>
  );
};

// pages/feed/index.ts
export { FeedPage } from './ui/FeedPage';
```

**패턴**:
- Widgets와 Features 조합만 사용
- 비즈니스 로직 최소화
- 레이아웃 및 구성에 집중

---

### Widgets 레이어 작성 패턴

```typescript
// widgets/post-feed/model/usePostFeed.ts
import { useEffect, useState } from 'react';
import { Post } from '@/entities/post';
import { fetchPosts } from '@/entities/post/api';

export const usePostFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPosts().then(data => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  return { posts, isLoading };
};

// widgets/post-feed/ui/PostFeed.tsx
import { PostCard } from '@/entities/post';
import { LikeButton } from '@/features/like-post';
import { usePostFeed } from '../model/usePostFeed';

export const PostFeed = () => {
  const { posts, isLoading } = usePostFeed();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="post-feed">
      {posts.map(post => (
        <div key={post.id}>
          <PostCard post={post} />
          <LikeButton postId={post.id} />
        </div>
      ))}
    </div>
  );
};

// widgets/post-feed/index.ts
export { PostFeed } from './ui/PostFeed';
```

**패턴**:
- 여러 Features와 Entities 조합
- 독립적인 비즈니스 컨텍스트
- 재사용 가능한 큰 단위 블록

---

### Features 레이어 작성 패턴

```typescript
// features/create-post/model/useCreatePost.ts
import { useState } from 'react';
import { createPost } from '../api/createPostApi';
import { Post } from '@/entities/post';

export const useCreatePost = () => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await createPost({ content });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    content,
    setContent,
    handleSubmit,
    isSubmitting,
  };
};

// features/create-post/ui/CreatePostForm.tsx
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { useCreatePost } from '../model/useCreatePost';

export const CreatePostForm = () => {
  const { content, setContent, handleSubmit, isSubmitting } = useCreatePost();

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
      />
      <Button type="submit" disabled={isSubmitting}>
        Post
      </Button>
    </form>
  );
};

// features/create-post/api/createPostApi.ts
import { apiClient } from '@/shared/api';

interface CreatePostDto {
  content: string;
}

export const createPost = async (data: CreatePostDto) => {
  const response = await apiClient.post('/posts', data);
  return response.data;
};

// features/create-post/index.ts
export { CreatePostForm } from './ui/CreatePostForm';
```

**패턴**:
- 하나의 독립적인 기능에 집중
- 재사용 가능하도록 설계
- Entities와 Shared만 참조

---

### Entities 레이어 작성 패턴

```typescript
// entities/post/model/types.ts
export interface Post {
  id: string;
  authorId: string;
  content: string;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
}

// entities/post/ui/PostCard.tsx
import { Post } from '../model/types';
import { UserAvatar } from '@/entities/user';
import { formatRelativeTime } from '@/shared/lib';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <article className="post-card">
      <header>
        <UserAvatar userId={post.authorId} />
        <time>{formatRelativeTime(post.createdAt)}</time>
      </header>
      <p>{post.content}</p>
      <footer>
        <span>{post.likesCount} likes</span>
        <span>{post.commentsCount} comments</span>
      </footer>
    </article>
  );
};

// entities/post/api/postApi.ts
import { apiClient } from '@/shared/api';
import { Post } from '../model/types';

export const fetchPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get('/posts');
  return response.data;
};

export const fetchPost = async (id: string): Promise<Post> => {
  const response = await apiClient.get(`/posts/${id}`);
  return response.data;
};

// entities/post/index.ts
export { PostCard } from './ui/PostCard';
export type { Post } from './model/types';
export { fetchPosts, fetchPost } from './api/postApi';
```

**패턴**:
- 데이터 중심 구조
- 비즈니스 엔티티 표현
- 다른 Entities와 Shared만 참조

---

### Shared 레이어 작성 패턴

```typescript
// shared/ui/button/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'medium',
  children,
  className = '',
  ...props
}: ButtonProps) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// shared/ui/button/index.ts
export { Button } from './Button';

// shared/hooks/useDebounce.ts
import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// shared/hooks/index.ts
export { useDebounce } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
```

**패턴**:
- 비즈니스 로직 독립적
- 기술적 재사용성에 집중
- 범용적으로 사용 가능

---

## 의존성 규칙

### 레이어 간 의존성

```
app      ──→ pages, widgets, features, entities, shared
pages    ──→ widgets, features, entities, shared
widgets  ──→ features, entities, shared
features ──→ entities, shared
entities ──→ shared
shared   (의존성 없음)
```

### 슬라이스 간 의존성

```
✅ 허용:
features/follow-user → entities/user
features/like-post   → entities/post
widgets/user-profile → features/follow-user
widgets/user-profile → entities/user

❌ 금지:
features/follow-user → features/like-post
entities/user        → entities/post
pages/profile        → pages/feed
```

### Import 경로 예시

```typescript
// ✅ 올바른 import
import { Button } from '@/shared/ui/button';
import { User } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';

// ❌ 잘못된 import
import { LikeButton } from '@/features/like-post'; // features 간 참조
import { Post } from '@/entities/post';            // entities 간 참조
```

---

## 공개 API 패턴

### 공개 API란?

각 슬라이스는 `index.ts` 파일을 통해 외부에 노출할 요소를 정의합니다.

### 기본 패턴

```typescript
// features/follow-user/index.ts
export { FollowButton } from './ui/FollowButton';
export { useFollowUser } from './model/useFollowUser';
export type { FollowStatus } from './model/types';

// ❌ 내부 구현은 노출하지 않음
// export { followApi } from './api/followApi';
```

### 레이어별 공개 API 구조

```
📂 pages/
  📂 feed/
    📂 ui/
    📄 index.ts       // export { FeedPage } from './ui/FeedPage'

📂 widgets/
  📂 post-feed/
    📂 ui/
    📂 model/
    📄 index.ts       // export { PostFeed } from './ui/PostFeed'

📂 features/
  📂 create-post/
    📂 ui/
    📂 model/
    📂 api/
    📄 index.ts       // export { CreatePostForm } from './ui/CreatePostForm'

📂 entities/
  📂 post/
    📂 ui/
    📂 model/
    📂 api/
    📄 index.ts       // export { PostCard } from './ui/PostCard'
                      // export type { Post } from './model/types'

📂 shared/
  📂 ui/
    📄 index.ts       // export { Button } from './button'
                      // export { Input } from './input'
```

### Shared 레이어 공개 API

```typescript
// shared/ui/button/index.ts
export { Button } from './Button';
export type { ButtonProps } from './Button';

// shared/ui/index.ts
export { Button } from './button';
export { Input } from './input';
export { Modal } from './modal';

// 사용
import { Button, Input, Modal } from '@/shared/ui';
```

---

## 베스트 프랙티스

### 1. 레이어 선택 기준

**질문 체크리스트**:

1. **전체 페이지인가?** → `pages`
2. **여러 기능을 조합한 독립적 블록인가?** → `widgets`
3. **사용자 인터랙션을 처리하는 기능인가?** → `features`
4. **비즈니스 데이터 모델인가?** → `entities`
5. **모든 곳에서 사용되는 공통 요소인가?** → `shared`

### 2. 슬라이스 명명 규칙

```
✅ 좋은 이름:
- features/follow-user
- features/create-post
- entities/user
- widgets/post-feed

❌ 나쁜 이름:
- features/followUserFeature (중복 표현)
- features/utils (너무 범용적)
- entities/data (의미 불명확)
```

### 3. 세그먼트 구성

**필수 세그먼트**:
- `ui/` - UI 컴포넌트 (대부분의 슬라이스)
- `index.ts` - 공개 API (모든 슬라이스)

**선택적 세그먼트** (필요시 추가):
- `model/` - 상태 관리, 비즈니스 로직
- `api/` - 백엔드 통신
- `lib/` - 유틸리티 함수

### 4. 코드 배치 원칙

```typescript
// ✅ 올바른 배치
// shared/ui/button - 범용 버튼
// features/follow-user/ui/FollowButton - 팔로우 전용 버튼

// ❌ 잘못된 배치
// shared/ui/follow-button - 비즈니스 로직이 포함된 버튼
```

**원칙**:
- Shared: 비즈니스 로직 없는 범용 요소
- Features: 특정 기능에 특화된 요소

### 5. Import 절대 경로 사용

```typescript
// tsconfig.json 또는 jsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/app/*": ["app/*"],
      "@/pages/*": ["pages/*"],
      "@/widgets/*": ["widgets/*"],
      "@/features/*": ["features/*"],
      "@/entities/*": ["entities/*"],
      "@/shared/*": ["shared/*"]
    }
  }
}

// 사용
import { Button } from '@/shared/ui/button';
import { User } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';
```

### 6. 타입 정의 위치

```typescript
// entities/user/model/types.ts - 비즈니스 엔티티 타입
export interface User {
  id: string;
  name: string;
}

// shared/types/common.ts - 범용 타입
export type ID = string;
export type Timestamp = number;

// features/follow-user/model/types.ts - 기능별 타입
export interface FollowStatus {
  isFollowing: boolean;
  isPending: boolean;
}
```

### 7. 상태 관리 배치

```typescript
// entities/user/model/userStore.ts - 전역 사용자 상태
export const useUserStore = create((set) => ({
  currentUser: null,
  setUser: (user) => set({ currentUser: user }),
}));

// features/follow-user/model/followStore.ts - 기능별 상태
export const useFollowStore = create((set) => ({
  followingUsers: [],
  toggleFollow: (userId) => { /* ... */ },
}));

// widgets/post-feed/model/postFeedStore.ts - 위젯 로컬 상태
export const usePostFeedStore = create((set) => ({
  posts: [],
  isLoading: false,
}));
```

**원칙**:
- 전역 상태 → `entities`
- 기능별 상태 → `features`
- 위젯 로컬 상태 → `widgets`

### 8. API 레이어 구성

```typescript
// shared/api/apiClient.ts - 기본 HTTP 클라이언트
export const apiClient = axios.create({
  baseURL: process.env.API_URL,
});

// entities/user/api/userApi.ts - 엔티티 기본 CRUD
export const fetchUser = (id: string) => 
  apiClient.get(`/users/${id}`);

// features/follow-user/api/followApi.ts - 기능별 API
export const followUser = (userId: string) =>
  apiClient.post(`/users/${userId}/follow`);
```

---

## 안티패턴

### 1. ❌ 같은 레이어의 슬라이스 참조

```typescript
// ❌ 잘못된 예: features 간 참조
// features/follow-user/ui/FollowButton.tsx
import { LikeButton } from '@/features/like-post'; // ❌

export const FollowButton = ({ userId }) => {
  return (
    <div>
      <Button>Follow</Button>
      <LikeButton /> {/* ❌ */}
    </div>
  );
};

// ✅ 올바른 예: 상위 레이어에서 조합
// widgets/user-actions/ui/UserActions.tsx
import { FollowButton } from '@/features/follow-user';
import { LikeButton } from '@/features/like-post';

export const UserActions = ({ userId }) => {
  return (
    <div>
      <FollowButton userId={userId} />
      <LikeButton userId={userId} />
    </div>
  );
};
```

### 2. ❌ 하위 레이어가 상위 레이어 참조

```typescript
// ❌ 잘못된 예
// entities/user/ui/UserCard.tsx
import { FollowButton } from '@/features/follow-user'; // ❌

// ✅ 올바른 예
// widgets/user-profile/ui/UserProfile.tsx
import { UserCard } from '@/entities/user';
import { FollowButton } from '@/features/follow-user';
```

### 3. ❌ 비즈니스 로직이 Shared에 위치

```typescript
// ❌ 잘못된 예
// shared/lib/userHelpers.ts
export const followUser = async (userId: string) => {
  // 비즈니스 로직이 shared에 있으면 안됨
};

// ✅ 올바른 예
// features/follow-user/lib/followHelpers.ts
export const validateFollowAction = (userId: string) => {
  // 기능별 헬퍼는 features에
};

// shared/lib/validators.ts
export const validateEmail = (email: string) => {
  // 범용 유틸리티만 shared에
};
```

### 4. ❌ 공개 API 없이 직접 참조

```typescript
// ❌ 잘못된 예
import { FollowButton } from '@/features/follow-user/ui/FollowButton';

// ✅ 올바른 예
import { FollowButton } from '@/features/follow-user';
```

### 5. ❌ Pages에 복잡한 비즈니스 로직

```typescript
// ❌ 잘못된 예
// pages/profile/ui/ProfilePage.tsx
export const ProfilePage = () => {
  const [user, setUser] = useState(null);
  
  // 복잡한 비즈니스 로직
  const handleFollow = async () => {
    // 많은 로직...
  };

  return (
    <div>
      <button onClick={handleFollow}>Follow</button>
    </div>
  );
};

// ✅ 올바른 예
// pages/profile/ui/ProfilePage.tsx
import { UserProfile } from '@/widgets/user-profile';

export const ProfilePage = () => {
  return <UserProfile />;
};

// widgets/user-profile/ui/UserProfile.tsx
import { FollowButton } from '@/features/follow-user';
```

### 6. ❌ 거대한 Shared 레이어

```typescript
// ❌ 잘못된 예
// shared/components/ - 모든 컴포넌트를 shared에
//   UserCard.tsx
//   PostCard.tsx
//   CommentItem.tsx
//   FollowButton.tsx

// ✅ 올바른 예
// shared/ui/ - 범용 UI만
//   Button.tsx
//   Input.tsx
//   Modal.tsx
// entities/user/ui/
//   UserCard.tsx
// entities/post/ui/
//   PostCard.tsx
```

### 7. ❌ 슬라이스 없는 레이어

```typescript
// ❌ 잘못된 예
features/
  FollowButton.tsx
  LikeButton.tsx
  
// ✅ 올바른 예
features/
  follow-user/
    ui/
      FollowButton.tsx
    index.ts
  like-post/
    ui/
      LikeButton.tsx
    index.ts
```

### 8. ❌ 너무 깊은 세그먼트 중첩

```typescript
// ❌ 잘못된 예
features/
  follow-user/
    ui/
      components/
        buttons/
          primary/
            FollowButton.tsx

// ✅ 올바른 예
features/
  follow-user/
    ui/
      FollowButton.tsx
```

---

## 마이그레이션 가이드

### 기존 프로젝트를 FSD로 전환

**1단계: Shared 레이어 구성**
```
기존 components/ → shared/ui/
기존 utils/      → shared/lib/
기존 api/        → shared/api/
```

**2단계: Entities 추출**
```
비즈니스 모델 타입과 컴포넌트를 entities로 이동
User, Post, Product 등
```

**3단계: Features 분리**
```
사용자 인터랙션 기능을 features로 추출
로그인, 팔로우, 좋아요 등
```

**4단계: Widgets 구성**
```
여러 features를 조합하는 큰 블록을 widgets로
헤더, 사이드바, 프로필 카드 등
```

**5단계: Pages 정리**
```
라우트별 페이지를 pages로 정리
/home, /profile, /settings 등
```

---

## 추가 리소스

### 공식 문서
- FSD 공식 사이트: https://feature-sliced.design/
- GitHub: https://github.com/feature-sliced/documentation

### 도구
- ESLint 플러그인: `eslint-plugin-boundaries` (레이어 규칙 강제)
- VS Code 확장: FSD 구조 탐색 도구

### 커뮤니티
- Discord: FSD 공식 디스코드 채널
- GitHub Discussions: 질문 및 토론

---

## 요약

### FSD 핵심 체크리스트

✅ **레이어 구조**
- [ ] 7개 표준 레이어 이해 (app, pages, widgets, features, entities, shared)
- [ ] 레이어 간 단방향 의존성 준수

✅ **슬라이스**
- [ ] 비즈니스 도메인별로 슬라이스 구성
- [ ] 같은 레이어의 슬라이스 간 참조 금지

✅ **세그먼트**
- [ ] ui, model, api, lib 등 표준 세그먼트 활용
- [ ] 각 세그먼트의 책임 명확히 분리

✅ **공개 API**
- [ ] 모든 슬라이스에 index.ts 파일
- [ ] 필요한 것만 export

✅ **코드 품질**
- [ ] 절대 경로 import 설정
- [ ] TypeScript 타입 정의 활용
- [ ] ESLint 규칙으로 의존성 검증

---

**이 가이드가 FSD 아키텍처를 올바르게 적용하는 데 도움이 되기를 바랍니다!**
