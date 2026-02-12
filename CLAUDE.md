# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Stair Crusher Club Admin (계단뿌셔클럽 어드민) - Admin dashboard for managing accessibility data, challenges, quests, regions, and push notifications.

## Development Setup & Commands

### Prerequisites
- Node.js 20 (managed via .node-version)
- pnpm 10.x (package manager)

### Essential Commands
```bash
# Install dependencies
pnpm i

# Generate Panda CSS styles (required before dev/build)
pnpm panda

# Start development server (port 3066)
pnpm dev

# Build for production
pnpm build

# Lint code
pnpm lint

# Type checking
pnpm typecheck

# Generate API client from OpenAPI spec
pnpm codegen
```

### Environment Configuration
- Set `NEXT_PUBLIC_DEPLOY_TYPE` to `dev` or `live` to switch API endpoints
- Dev API: `https://api.dev.staircrusher.club/admin`
- Live API: `https://api.staircrusher.club/admin`

Example:
```bash
NEXT_PUBLIC_DEPLOY_TYPE=live pnpm dev
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Styling**: Panda CSS (generates styled-system directory)
- **State Management**: React Query (TanStack Query) + Jotai
- **API Client**: Generated TypeScript-Axios client from OpenAPI spec
- **Forms**: React Hook Form
- **Maps**: Kakao Maps API

### Directory Structure

```
app/
├── (api)/          # API routes
├── (private)/      # Authenticated admin pages
│   ├── accessibility/
│   ├── banner/
│   ├── challenge/
│   ├── quest/
│   ├── region/
│   └── searchPreset/
├── (public)/       # Public pages (login, guides)
├── components/     # Shared components
├── hooks/         # Custom hooks
└── icons/         # Icon components

lib/
├── apis/          # API wrapper functions
├── generated-sources/openapi/  # Auto-generated API client
└── storage.ts     # LocalStorage wrapper
```

### Key Architecture Patterns

1. **Route Groups**: Uses Next.js route groups `(private)` and `(public)` for layout segregation
2. **Authentication**: Token-based auth checked in `(private)/layout.tsx`
3. **API Generation**: OpenAPI spec generates TypeScript client in `lib/generated-sources/openapi/`
4. **Styling**: Panda CSS with configuration in `panda.config.ts`, outputs to `styled-system/`
5. **Data Fetching**: React Query for server state management with custom hooks in `lib/apis/api.ts`

### Path Aliases
- `@/styles/*` → `./styled-system/*`
- `@/lib/*` → `./lib/*`
- `@/*` → `./app/*`

## New Page Development Checklist

새 어드민 페이지 추가 시 아래 순서대로 진행:

1. **Route**: `app/(private)/{feature}/page.tsx` 생성
2. **Menu**: `app/constants/menu.ts` → `menuItems` 배열에 항목 추가 (사이드바 자동 반영)
3. **API Hook**: `lib/apis/{feature}.ts` → `useQuery`/`useMutation`/`useInfiniteQuery`
4. **DataTable** (목록 페이지):
   - `app/(private)/{feature}/components/columns.tsx` → `ColumnDef[]` 배열
   - `<DataTable columns={columns} data={items} onLoadMore={fetchNextPage} hasMore={hasNextPage} />`
5. **Form** (생성/수정 페이지):
   - `react-hook-form` + `@reactleaf/input/hookform` (TextInput, NumberInput, DateInput)
   - shadcn Select/Checkbox → `Controller` 컴포넌트로 연결
6. **Modal/Sheet** (필요 시):
   - `app/modals/register.ts`에 등록 (lazy import)
   - `useModal()` hook으로 `openModal({ type: "MyModal", props: {...} })`
   - RightSheet 템플릿: `app/modals/_template/RightSheet/`
7. **Layout**: `<Contents.Normal>` (일반) / `<Contents.Columns>` (분할)
8. **Header Actions**: `<PageActions>` 컴포넌트로 헤더 버튼 추가

### Styling Rules

| 대상 | 스타일링 | 예시 |
|------|---------|------|
| shadcn/ui 컴포넌트 (Button, Card, DataTable 등) | **Tailwind CSS** | `className="gap-2 text-sm"` |
| 커스텀 레이아웃/컴포넌트 | **Panda CSS** | `styled()`, `css()`, `<Flex>` |
| `app/components/ui/` 내부 | Tailwind (건드리지 않음) | shadcn/ui 원본 |

> `panda.config.ts`에서 `app/components/ui/`는 Panda CSS exclude 됨. Tailwind `preflight: false`로 충돌 방지.

### React Query Hook 패턴

```typescript
// lib/apis/{feature}.ts
import { useQuery, useMutation, useInfiniteQuery, useQueryClient } from "@tanstack/react-query"
import { api } from "./api"

// 목록 조회 (cursor 페이징)
export function useMyItems(filter?: string) {
  return useInfiniteQuery({
    queryKey: ["@my-items", filter],
    queryFn: ({ pageParam }) => api.myApi.listItems(filter, pageParam, 20).then(r => r.data),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
  })
}

// 단건 조회
export function useMyItem(id: string) {
  return useQuery({
    queryKey: ["@my-item", id],
    queryFn: () => api.myApi.getItem(id).then(r => r.data),
    enabled: !!id,
  })
}

// 변경 (mutation)
export function useUpdateMyItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UpdateRequest) => api.myApi.updateItem(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["@my-items"] }),
  })
}
```

### API Client 구조

API 인스턴스는 `lib/apis/api.ts`에서 중앙 관리. 새 API 클래스 추가 시 여기에 등록:
```typescript
export const api = {
  default: new DefaultApi(config),
  challenge: new ChallengeApi(config),
  // 새 API 추가: myFeature: new MyFeatureApi(config),
}
```

## API Integration

The app communicates with the backend through a generated TypeScript client:

1. **OpenAPI Spec**: Located in `subprojects/scc-api/admin-api-spec.yaml`
2. **Generation**: Run `pnpm codegen` to regenerate client
3. **API Instances**: Configured in `lib/apis/api.ts` with environment-based base URLs
4. **Custom Hooks**: Data fetching hooks use React Query for caching and state management

### Key API Services
- `DefaultApi`: General operations (quests, regions, notifications)
- `ChallengeApi`: Challenge management
- `BannerApi`: Banner management
- `AccessibilityApi`: Accessibility data management

## CI/CD Pipeline

### Pull Request CI (`pr-ci.yaml`)
- Installs dependencies
- Runs linting
- Generates Panda CSS
- Builds the application

### Deployment
- **Dev**: Auto-deploys on push to `main` branch
- **Prod**: Deploys on semantic versioning tags (e.g., `v1.0.0`)

## Code Style

- **Prettier**: Configured with import sorting plugin
- **ESLint**: Next.js core-web-vitals with `react-hooks/exhaustive-deps` disabled
- **TypeScript**: Strict mode enabled
- **Import Order**: Enforced by Prettier plugin (`@/lib`, `@/`, `@/styles`, relative imports)

## Important Notes

1. Always run `pnpm panda` before starting development or building
2. The app requires authentication token in localStorage for private routes
3. Images are served from S3 buckets and CloudFront CDNs (configured in `next.config.js`)
4. Map functionality uses Kakao Maps API (types from `kakao.maps.d.ts`)
5. The project uses pnpm workspaces - ensure pnpm is enabled via corepack