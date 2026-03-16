# CLAUDE.md

## Project Overview

GradeOwl Web is a Next.js web client for the GradeOwl exam grading platform. Teachers upload question papers and answer keys, configure AI-generated rubrics, upload student submissions, and review AI-graded results with cluster analysis.

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router, `output: "standalone"`)
- **Styling**: Tailwind CSS v4 (CSS-first config, `@theme inline` in globals.css, oklch colors)
- **UI Library**: shadcn/ui v4 (base-nova style, `@base-ui/react`)
- **Server State**: TanStack Query v5
- **Client State**: Zustand v5 (auth store, UI store)
- **Auth**: Firebase JS SDK v12 (Google Sign-In + email/password)
- **Testing**: Vitest + MSW (unit/hook tests), Playwright (E2E)
- **Component Dev**: Storybook 8

## Dev Commands

```bash
npm run dev          # Start dev server (port 3000)
npm test             # Run Vitest unit tests
npm run build        # Production build
npm run lint         # ESLint
npm run storybook    # Storybook dev server (port 6006)
npx tsc --noEmit     # Type check
npx playwright test  # Run E2E tests (requires dev server or uses webServer config)
```

## Project Structure

```
gradeowl-web/
├── app/
│   ├── (auth)/login/         # Login page (Firebase auth)
│   ├── (dashboard)/          # Authenticated pages with sidebar layout
│   │   ├── page.tsx          # Exam list (home)
│   │   ├── exams/new/        # Create exam form
│   │   └── exams/[id]/       # Exam dashboard with sub-pages
│   │       ├── upload/       # QP/AK upload + analysis
│   │       ├── rubric/       # AI rubric review + editing
│   │       ├── submissions/  # Student submission upload
│   │       ├── grading/      # Grading progress tracker
│   │       ├── review/       # Cluster review panel
│   │       └── results/      # Results table + analytics
│   ├── api/
│   │   ├── auth/token/       # Firebase ID token → backend JWT exchange
│   │   ├── auth/refresh/     # JWT refresh (httpOnly cookie rotation)
│   │   ├── auth/logout/      # Clear auth cookies
│   │   └── proxy/[...path]/  # API proxy to backend (attaches JWT from cookie)
│   ├── globals.css           # Tailwind v4 theme (oklch + semantic colors)
│   ├── layout.tsx            # Root layout with Inter font
│   └── providers.tsx         # QueryClientProvider + Toaster
├── components/
│   ├── ui/                   # shadcn/ui primitives (badge, button, card, dialog, etc.)
│   ├── status-badge.tsx      # ExamStatus color-coded badge
│   ├── exam-card.tsx         # Exam list card with dropdown menu
│   ├── exam-stepper.tsx      # 6-step exam workflow stepper
│   ├── drop-zone.tsx         # Drag-drop file upload with MIME validation
│   ├── rubric-editor.tsx     # Per-question rubric card with criteria editing
│   ├── score-cell.tsx        # Color-coded score display
│   ├── analysis-progress.tsx # QP/AK analysis progress tracker
│   ├── analytics-charts.tsx  # Recharts bar/scatter plots for results
│   ├── cluster-panel.tsx     # Three-panel cluster review
│   ├── results-table.tsx     # Student results data table
│   ├── page-thumbnail.tsx    # Image thumbnail with auth token
│   ├── sidebar.tsx           # Dashboard sidebar navigation
│   └── *.stories.tsx         # Storybook stories for key components
├── lib/
│   ├── api/
│   │   ├── client.ts         # Fetch wrapper (proxy-based, auto-refresh on 401)
│   │   ├── types.ts          # TypeScript interfaces matching backend models
│   │   └── hooks/            # TanStack Query hooks (use-exams, use-rubrics, etc.)
│   ├── stores/
│   │   └── auth-store.ts     # Zustand auth store (user, logout)
│   ├── firebase.ts           # Firebase app + auth + Google provider init
│   └── utils.ts              # cn() classname merge utility
├── mocks/                    # MSW handlers + server for tests
├── __tests__/                # Vitest unit tests (api/, hooks/, stores/)
├── e2e/                      # Playwright E2E tests
├── .storybook/               # Storybook config (main.ts, preview.ts)
├── .github/workflows/        # CI (lint, test, build, e2e) + Deploy (Cloud Run)
├── middleware.ts              # Auth redirect (cookie check)
├── Dockerfile                # Multi-stage standalone build for Cloud Run
└── playwright.config.ts      # Playwright config
```

## Key Architectural Decisions

### API Proxy Pattern
All API calls go through `/api/proxy/[...path]` which:
- Reads the JWT from `gradeowl_access_token` httpOnly cookie
- Forwards requests to the backend (`API_URL` env var)
- Auto-refreshes expired tokens via `/api/auth/refresh`
- Keeps tokens out of client-side JavaScript
- Strips `content-encoding` and `content-length` from backend responses because Node.js `fetch` auto-decompresses gzip — forwarding the original headers would cause clients to expect compressed data they already received decompressed

### Authentication Flow
1. Client authenticates via Firebase (Google Sign-In or email/password)
2. Firebase ID token is exchanged at `/api/auth/token` for a backend JWT
3. Backend JWT + refresh token stored as httpOnly cookies
4. Middleware redirects unauthenticated users to `/login`

### Exam Lifecycle
`DRAFT` → `RUBRIC_REVIEW` → `GRADING` → `CLUSTERING` → `COMPLETE`

### 6-Step Exam Stepper
Upload → Rubric → Submissions → Grading → Review → Results

Steps unlock progressively based on exam state (analysis complete, rubric approved, submissions uploaded, grading status).

### Color Palette (Color Hunt)
- **Cream** (#FFFBF1) — background
- **Coral** (#E36A6A) — primary/accent
- **Warm Yellow** (#FFF2D0) — secondary
- **Soft Pink** (#FFB2B2) — accent
- **Success** (#16a34a) — green
- **Warning** (#b45309) — amber

## Branch Strategy

- **main** — production, auto-deploys to Cloud Run. Never commit directly.
- **dev** — integration branch. CI runs on PRs.
- All work on `feature/*`, `fix/*`, or `chore/*` branches off `dev`.
- PR flow: `feature → dev` (CI checks), then `dev → main` (CI + deploy).

## Testing

- **Unit/Hook tests**: Vitest + React Testing Library + MSW. Run with `npm test`.
- **E2E tests**: Playwright with chromium. Run with `npx playwright test`.
- **Component stories**: Storybook 8 with `@storybook/nextjs`. Run with `npm run storybook`.

## Deployment

- **Platform**: Google Cloud Run (`asia-south1`)
- **Image**: Multi-stage Dockerfile with standalone Next.js output
- **Registry**: `asia-south1-docker.pkg.dev/neuraconcept-grading/grading-services/gradeowl-web`
- **Auth**: Workload Identity Federation (OIDC) — no stored keys
- **Public URL**: `https://gradeowl.neuraconcept.com` (Cloudflare Worker proxy to Cloud Run)
- **Backend**: `https://api.neuraconcept.com`
- **Firebase project**: `neuraconcept-grading`
- **CI/CD**: GitHub Actions (see below)

## CI/CD Workflows

| Workflow | File | Trigger | Purpose |
|---|---|---|---|
| CI | `ci.yml` | PR to main/dev, push to dev | Lint, typecheck, test, build, Playwright E2E |
| Deploy | `deploy.yml` | Push to main | Build Docker image, push to Artifact Registry, deploy to Cloud Run |
| Release PR | `release-pr.yml` | Push to dev | Auto-creates `dev → main` release PR |
| Claude Code | `claude.yml` | `@claude` mentions in issues/PRs | Claude Code action for issue triage |
| Claude Code Review | `claude-code-review.yml` | PR opened/sync/reopen | Auto-reviews PRs using code-review plugin |

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `API_URL` | Server-side | Backend URL for proxy (e.g., `https://api.neuraconcept.com`) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client | Firebase Web API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client | Firebase project ID |
