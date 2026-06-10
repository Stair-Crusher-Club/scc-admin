# SCC Admin Development Guide

Stair Crusher Club Admin (계단뿌셔클럽 어드민) — 접근성 데이터/챌린지/퀘스트/지역/푸시 관리 대시보드.

## Commands

Node.js 20 (.node-version) + pnpm 10.x (corepack로 활성화, pnpm workspaces).

```bash
pnpm i           # 의존성 설치
pnpm panda       # Panda CSS 생성 (dev/build 전 필수)
pnpm dev         # dev server (port 3066)
pnpm build       # production 빌드
pnpm lint        # lint
pnpm typecheck   # 타입 체크
pnpm codegen     # OpenAPI 스펙 → API 클라이언트 생성
```

### 환경 설정

- `NEXT_PUBLIC_DEPLOY_TYPE` = `dev` | `live` (| `local`)로 API 엔드포인트 전환
- Dev: `https://api.dev.staircrusher.club/admin` / Live: `https://api.staircrusher.club/admin`
- 예: `NEXT_PUBLIC_DEPLOY_TYPE=live pnpm dev`

## Architecture

- **Stack**: Next.js 14 App Router / Panda CSS (`panda.config.ts` → `styled-system/`) / React Query + Jotai / TypeScript-Axios 생성 클라이언트 / React Hook Form / Kakao Maps API (`kakao.maps.d.ts`)
- **Route groups**: `(private)` 인증 어드민 페이지 (accessibility, banner, challenge, quest, region, searchPreset), `(public)` 로그인/가이드, `(api)` API 라우트
- **인증**: localStorage 토큰 기반, `(private)/layout.tsx`에서 체크
- **API**: 스펙은 `subprojects/scc-api/admin-api-spec.yaml` → `pnpm codegen` → `lib/generated-sources/openapi/` (수동 수정은 hook이 차단). API 인스턴스/훅은 `lib/apis/api.ts`
- **주요 API 서비스**: `DefaultApi`(퀘스트/지역/알림), `ChallengeApi`, `BannerApi`, `AccessibilityApi`

### Path Aliases

- `@/styles/*` → `./styled-system/*`, `@/lib/*` → `./lib/*`, `@/*` → `./app/*`

## CI/CD

- PR CI: install → lint → panda → build
- Dev는 main push 시 자동 배포, Prod는 semver 태그(`v1.0.0`)로 배포

## Code Style

- Prettier(import 정렬 플러그인: `@/lib`, `@/`, `@/styles`, relative 순), ESLint(next core-web-vitals, exhaustive-deps off), TypeScript strict

## Notes

- dev/build 전 `pnpm panda` 필수 (styled-system 생성)
- 이미지는 S3 + CloudFront에서 서빙 (`next.config.js`에 도메인 설정)
- 새 페이지 추가 절차/템플릿: `/scc-admin-add-page`

---

이 파일은 fact만 담는다. 절차는 skill, 강제 규칙은 workspace `.claude/hooks/` 참조. 줄수 상한 120.
