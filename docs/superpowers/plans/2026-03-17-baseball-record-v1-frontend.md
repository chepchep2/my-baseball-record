# Baseball Record V1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 프론트엔드를 Next.js 기반 모바일 웹으로 구성해 Google 로그인, 기록 확인 요약 화면, 상세 기록 화면, 경기 원자적 저장 흐름, 시즌/통산 기록 조회를 백엔드 API와 연결한다.

**Architecture:** Next.js App Router를 기준으로 인증 화면, 기록 확인 요약 화면, 상세 기록 화면, 경기 입력 화면을 구성한다. 기본 보호 홈은 `/records`로 두고, 인증 없는 접근은 로그인 화면으로 보낸다. 기록 화면은 `요약 화면 -> 상세 기록 화면` 구조를 유지하고, 경기 입력은 `경기 정보 -> 기록 입력`의 단계형 흐름으로 구성한다.

**Tech Stack:** Next.js, React, JavaScript, App Router, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library, Mock Service Worker

---

## Scope Source

이 계획은 아래 문서를 구현하는 용도다.

- `docs/prd.md`
- `docs/superpowers/specs/2026-03-17-scenario-v1.md`
- `docs/superpowers/specs/2026-03-16-baseball-record-v1-design.md`
- `docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- `docs/superpowers/specs/2026-03-17-frontend-ascii-wireframes.md`
- `docs/superpowers/specs/2026-03-17-api-contract-v1.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-overview.md`

이 계획은 새 제품 범위를 추가하지 않는다.

## Scope Summary

프론트엔드 v1에 포함한다.

- Google 로그인 시작과 복귀 처리
- 앱 세션 저장과 갱신
- 보호 페이지 진입 제어
- 기록 확인 요약 화면
- 상세 기록 화면
- 빈 상태
- 조회 로딩/실패 상태
- 경기 정보 입력 단계
- 기록 입력 단계
- 저장 중/실패 상태
- 이탈 경고

프론트엔드 v1에서 제외한다.

- 이메일/비밀번호 인증 화면
- 최근 경기 화면
- 팀 기능
- 외부 기록 가져오기 UI
- 상세 로그 입력 UI

## Assumptions

- 실제 프론트엔드 구현 위치는 현재 `frontend/` 디렉터리다.
- 프론트엔드는 Next.js 앱으로 교체 또는 재구성한다.
- 저장 API는 `POST /api/games` 하나의 원자적 저장 엔드포인트를 사용한다.
- 인증 화면은 `Google로 시작하기` 단일 행동만 제공한다.
- 인증이 없으면 `/records`, `/games/new`에 접근할 수 없다.
- 인증 성공 후 기본 홈은 `/records`다.
- 로그아웃 UI는 기록 확인 요약 화면을 아래로 내렸을 때 보이는 하단 저강도 영역에 둔다.
- 초기 배포는 Vercel을 기본 전제로 둔다.

## File Structure

### Project Setup

- Modify: `frontend/package.json`
- Modify: `frontend/next.config.js` 또는 `frontend/next.config.mjs`
- Modify: `frontend/jsconfig.json` 또는 `frontend/tsconfig.json`
- Modify: `frontend/src/app/layout.jsx`
- Modify: `frontend/src/app/page.jsx`
- Modify: `frontend/src/app/globals.css`

### App Routes

- Create: `frontend/src/app/auth/page.jsx`
- Create: `frontend/src/app/records/page.jsx`
- Create: `frontend/src/app/records/details/page.jsx`
- Create: `frontend/src/app/games/new/page.jsx`

### Shared Runtime

- Create: `frontend/src/components/providers/AppProviders.jsx`
- Create: `frontend/src/lib/query/queryClient.js`
- Create: `frontend/src/lib/http/apiClient.js`
- Create: `frontend/src/lib/http/tokenStorage.js`
- Create: `frontend/src/lib/http/authApi.js`
- Create: `frontend/src/lib/http/statsApi.js`
- Create: `frontend/src/lib/http/gamesApi.js`
- Create: `frontend/src/lib/auth/session.js`

### Shared UI

- Create: `frontend/src/components/common/Button.jsx`
- Create: `frontend/src/components/common/Banner.jsx`
- Create: `frontend/src/components/common/SegmentedControl.jsx`
- Create: `frontend/src/components/common/StatCard.jsx`
- Create: `frontend/src/components/common/EmptyState.jsx`
- Create: `frontend/src/components/common/LoadingState.jsx`

### Features

- Create: `frontend/src/features/auth/components/GoogleLoginPanel.jsx`
- Create: `frontend/src/features/auth/api/useGoogleLoginMutation.js`
- Create: `frontend/src/features/auth/api/useLogoutMutation.js`
- Create: `frontend/src/features/records/api/useStatsQuery.js`
- Create: `frontend/src/features/records/components/RecordSummarySection.jsx`
- Create: `frontend/src/features/records/components/RecordMetricGrid.jsx`
- Create: `frontend/src/features/records/components/RecordStateSection.jsx`
- Create: `frontend/src/features/records/utils/recordLabels.js`
- Create: `frontend/src/features/games/api/useSaveGameMutation.js`
- Create: `frontend/src/features/games/components/GameInfoStep.jsx`
- Create: `frontend/src/features/games/components/BatterRecordStep.jsx`
- Create: `frontend/src/features/games/components/PitcherRecordStep.jsx`
- Create: `frontend/src/features/games/components/RecordTabs.jsx`
- Create: `frontend/src/features/games/schema/gameSchemas.js`
- Create: `frontend/src/features/games/utils/gameMappers.js`

### Test Support

- Modify: `frontend/src/test/setup.js`
- Create: `frontend/src/test/renderWithProviders.jsx`
- Create: `frontend/src/test/server.js`
- Create: `frontend/src/test/handlers.js`

## Chunk 1: Next.js Runtime And Base Routes

### Task 1: Next.js 앱 골격과 기본 페이지를 구성한다

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/app/layout.jsx`
- Modify: `frontend/src/app/page.jsx`
- Create: `frontend/src/app/auth/page.jsx`
- Create: `frontend/src/app/records/page.jsx`
- Create: `frontend/src/app/records/details/page.jsx`
- Create: `frontend/src/app/games/new/page.jsx`
- Create: `frontend/src/components/providers/AppProviders.jsx`
- Create: `frontend/src/lib/query/queryClient.js`

- [ ] **Step 1: Next.js 앱 진입 구조를 만든다**

반영 내용:
- App Router 기준 디렉터리 구조
- 전역 layout
- 글로벌 스타일 연결
- `/`에서 `/auth` 또는 `/records` 진입 설계

- [ ] **Step 2: 기본 페이지 라우트를 만든다**

반영 내용:
- `/auth`
- `/records`
- `/records/details`
- `/games/new`

- [ ] **Step 3: 로컬 실행으로 페이지 전환을 확인한다**

Run: `cd frontend && npm run dev`
Expected: 각 경로가 Next.js 라우팅으로 정상 렌더링

- [ ] **Step 4: 커밋한다**

```bash
git add frontend/package.json frontend/src/app frontend/src/components/providers frontend/src/lib/query
git commit -m "기능: Next.js 앱 기본 구조와 라우트 구성"
```

## Chunk 2: Auth And Session

### Task 2: Google 로그인 화면과 앱 세션 구조를 만든다

**Files:**
- Create: `frontend/src/features/auth/components/GoogleLoginPanel.jsx`
- Create: `frontend/src/features/auth/api/useGoogleLoginMutation.js`
- Create: `frontend/src/features/auth/api/useLogoutMutation.js`
- Create: `frontend/src/lib/http/tokenStorage.js`
- Create: `frontend/src/lib/http/authApi.js`
- Create: `frontend/src/lib/auth/session.js`
- Modify: `frontend/src/app/auth/page.jsx`

- [ ] **Step 1: 인증 화면을 구현한다**

반영 내용:
- `MY BASEBALL RECORD`
- `Google로 시작하기` 단일 행동
- 로그인 실패 배너의 조건부 노출

- [ ] **Step 2: 세션 저장소와 인증 API 경계를 만든다**

반영 내용:
- token storage
- session hydration
- logout action

- [ ] **Step 3: 인증 없는 접근을 `/auth`로 보내는 기준을 적용한다**

반영 내용:
- `/records`
- `/records/details`
- `/games/new`

- [ ] **Step 4: 커밋한다**

```bash
git add frontend/src/app/auth frontend/src/features/auth frontend/src/lib/auth frontend/src/lib/http
git commit -m "기능: 구글 로그인과 앱 세션 구조 구현"
```

## Chunk 3: Records Screens

### Task 3: 요약 화면과 상세 기록 화면을 구현한다

**Files:**
- Create: `frontend/src/features/records/api/useStatsQuery.js`
- Create: `frontend/src/features/records/components/RecordSummarySection.jsx`
- Create: `frontend/src/features/records/components/RecordMetricGrid.jsx`
- Create: `frontend/src/features/records/components/RecordStateSection.jsx`
- Create: `frontend/src/features/records/utils/recordLabels.js`
- Modify: `frontend/src/app/records/page.jsx`
- Modify: `frontend/src/app/records/details/page.jsx`
- Create: `frontend/src/lib/http/statsApi.js`

- [ ] **Step 1: 기록 확인 요약 화면을 구현한다**

반영 내용:
- 타자/투수 전환
- 요약 지표
- `경기 추가`
- `기록 보기`
- 로그아웃 하단 영역

- [ ] **Step 2: 상세 기록 화면을 구현한다**

반영 내용:
- 시즌/통산/시즌 선택
- 경기 유형 필터
- 타자/투수 전환
- 대표 지표
- 상세 지표
- 하단 뒤로 버튼

- [ ] **Step 3: 빈 상태/조회 실패/세션 만료 상태를 구현한다**

- [ ] **Step 4: 커밋한다**

```bash
git add frontend/src/app/records frontend/src/features/records frontend/src/lib/http/statsApi.js
git commit -m "기능: 기록 요약 화면과 상세 기록 화면 구현"
```

## Chunk 4: Game Input

### Task 4: 경기 입력 흐름을 구현한다

**Files:**
- Modify: `frontend/src/app/games/new/page.jsx`
- Create: `frontend/src/features/games/api/useSaveGameMutation.js`
- Create: `frontend/src/features/games/components/GameInfoStep.jsx`
- Create: `frontend/src/features/games/components/BatterRecordStep.jsx`
- Create: `frontend/src/features/games/components/PitcherRecordStep.jsx`
- Create: `frontend/src/features/games/components/RecordTabs.jsx`
- Create: `frontend/src/features/games/schema/gameSchemas.js`
- Create: `frontend/src/features/games/utils/gameMappers.js`
- Create: `frontend/src/lib/http/gamesApi.js`

- [ ] **Step 1: 경기 정보 단계 UI를 구현한다**

- [ ] **Step 2: 타자/투수 기록 입력 단계를 구현한다**

- [ ] **Step 3: 저장 실패와 이탈 경고 상태를 구현한다**

- [ ] **Step 4: 커밋한다**

```bash
git add frontend/src/app/games frontend/src/features/games frontend/src/lib/http/gamesApi.js
git commit -m "기능: 경기 입력 단계와 저장 흐름 구현"
```

## Chunk 5: Verification And Deployment

### Task 5: 검증과 배포 기준을 정리한다

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/app/globals.css`
- Modify: `frontend/src/test/setup.js`
- Create: `frontend/src/test/renderWithProviders.jsx`
- Create: `frontend/src/test/server.js`
- Create: `frontend/src/test/handlers.js`

- [ ] **Step 1: 핵심 화면 스모크 테스트를 추가한다**

검증 시나리오:
- `/auth` 렌더링
- `/records` 렌더링
- `/records/details` 렌더링
- `/games/new` 렌더링

- [ ] **Step 2: 빌드와 테스트를 실행한다**

Run:
- `cd frontend && npm run test`
- `cd frontend && npm run build`

Expected:
- PASS

- [ ] **Step 3: Vercel 배포 기준을 정리한다**

반영 내용:
- 환경변수 목록
- Google OAuth redirect URL
- API base URL

- [ ] **Step 4: 커밋한다**

```bash
git add frontend/package.json frontend/src/app/globals.css frontend/src/test
git commit -m "기능: 프론트 검증과 배포 기준 정리"
```
