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