---
name: scc-admin-add-page
description: Next.js 어드민에 새 페이지를 추가합니다. App Router, Panda CSS, React Query 패턴을 따릅니다.
---

# SCC Admin - 새 페이지 추가

## 입력 정보

1. **페이지 이름** - kebab-case (예: my-new-page)
2. **페이지 설명** - 페이지의 목적과 기능
3. **API 엔드포인트** (선택) - 사용할 Admin API

---

## Step 1: 페이지 디렉토리 생성

```
app/(private)/
└── {page-name}/
    ├── page.tsx          # 메인 페이지
    ├── components/       # (선택) 페이지 전용 컴포넌트
    └── [id]/             # (선택) 동적 라우트
        └── page.tsx
```

---

## Step 2: 페이지 컴포넌트 구현

### 기본 템플릿 (목록 페이지)

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { css } from '@/styles/css';
import { flex, stack } from '@/styles/patterns';
import { defaultApi } from '@/lib/apis/api';

export default function MyNewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['my-data'],
    queryFn: () => defaultApi.getMyData(),
  });

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>에러가 발생했습니다</div>;

  return (
    <div className={stack({ gap: '16px' })}>
      <h1 className={css({ fontSize: '24px', fontWeight: 'bold' })}>
        페이지 제목
      </h1>

      <div className={flex({ gap: '8px', wrap: 'wrap' })}>
        {data?.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
```

### 기본 템플릿 (폼 페이지)

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { css } from '@/styles/css';
import { stack } from '@/styles/patterns';
import { defaultApi } from '@/lib/apis/api';

interface FormData {
  name: string;
  description?: string;
}

export default function MyFormPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  const mutation = useMutation({
    mutationFn: (data: FormData) => defaultApi.createItem(data),
    onSuccess: () => {
      alert('저장되었습니다');
    },
    onError: () => {
      alert('에러가 발생했습니다');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <div className={stack({ gap: '16px' })}>
        <label className={css({ display: 'flex', flexDirection: 'column', gap: '4px' })}>
          이름
          <input
            {...register('name', { required: '이름을 입력해주세요' })}
            className={css({ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' })}
          />
          {errors.name && <span className={css({ color: 'red' })}>{errors.name.message}</span>}
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          className={css({
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            _disabled: { opacity: 0.5 },
          })}
        >
          {mutation.isPending ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
}
```

---

## Step 3: API 연동

### API 함수 추가 (필요한 경우)

`lib/apis/api.ts`에 API 호출 함수 추가:

```typescript
export const getMyData = async () => {
  const { data } = await defaultApi.getMyData();
  return data;
};
```

---

## Step 4: 네비게이션 링크 추가

사이드바나 헤더에 새 페이지 링크 추가 (해당하는 경우).

---

## Panda CSS 패턴

### 주요 패턴

```typescript
import { css } from '@/styles/css';
import { flex, stack, grid } from '@/styles/patterns';

// 기본 스타일
<div className={css({ padding: '16px', backgroundColor: 'white' })}>

// Flex 레이아웃
<div className={flex({ gap: '8px', align: 'center', justify: 'space-between' })}>

// Stack (수직 정렬)
<div className={stack({ gap: '16px' })}>

// Grid 레이아웃
<div className={grid({ columns: 3, gap: '16px' })}>
```

### 반응형 스타일

```typescript
css({
  padding: { base: '8px', md: '16px', lg: '24px' },
  fontSize: { base: '14px', md: '16px' },
})
```

---

## 필수 체크리스트

### 페이지 구조
- [ ] `'use client'` 지시문 (클라이언트 컴포넌트인 경우)
- [ ] 적절한 route group 선택 (`(private)` vs `(public)`)

### 스타일링
- [ ] Panda CSS 패턴 사용 (`css`, `flex`, `stack`)
- [ ] 인라인 스타일 금지
- [ ] 기존 페이지 패턴 참고

### API 연동
- [ ] `@/lib/generated-sources/openapi` 타입 사용
- [ ] React Query 사용 (`useQuery`, `useMutation`)
- [ ] 로딩/에러 상태 처리

### 폼 처리
- [ ] React Hook Form 사용
- [ ] 유효성 검증 추가
- [ ] 제출 중 버튼 비활성화

---

## 검증

```bash
pnpm panda       # Panda CSS 생성
pnpm lint        # ESLint 통과
pnpm typecheck   # TypeScript 통과
```

---

## 참조

- `CLAUDE.md` - 전체 개발 가이드라인
- 기존 페이지 참고: `app/(private)/` 디렉토리
- Panda CSS 문서: https://panda-css.com/
