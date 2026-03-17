# Baseball Record V1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 프론트엔드를 모바일 웹 SPA로 구성해 Google 로그인, 기록 확인 요약 화면, 상세 기록 화면, 경기 원자적 저장 흐름, 시즌/통산 기록 조회를 백엔드 API와 연결한다.

**Architecture:** React + JavaScript 기반 SPA를 구성하고, 기본 보호 홈은 `/records`로 둔다. 인증은 Google 로그인 시작과 앱 세션 관리로 분리하고, 기록 화면은 `요약 화면 -> 상세 기록 화면` 구조를 유지한다. 경기 입력은 `경기 정보 -> 기록 입력`의 단계형 흐름으로 구성하며, 저장은 사용자 관점에서 하나의 `저장` 액션으로 동작하게 한다.

**Tech Stack:** React, JavaScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library, Mock Service Worker

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
- 보호 라우트
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
- 저장 API는 `POST /api/games` 하나의 원자적 저장 엔드포인트를 사용한다.
- 인증 화면은 `Google로 계속하기` 단일 행동만 제공한다.
- 인증이 없으면 `/records`, `/games/new`에 접근할 수 없다.
- 인증 성공 후 기본 홈은 `/records`다.
- 로그아웃 UI는 기록 확인 요약 화면을 아래로 내렸을 때 보이는 하단 저강도 영역에 둔다.

## File Structure

### Project Setup

- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.js`
- Modify: `frontend/index.html`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/styles/reset.css`
- Modify: `frontend/src/styles/theme.css`
- Modify: `frontend/src/styles/global.css`

### App Providers And Routing

- Modify: `frontend/src/app/providers/AppProviders.jsx`
- Modify: `frontend/src/app/router/AppRouter.jsx`
- Create: `frontend/src/app/router/ProtectedRoute.jsx`
- Create: `frontend/src/app/router/PublicOnlyRoute.jsx`

### Config And API

- Create: `frontend/src/config/env.js`
- Create: `frontend/src/lib/http/apiClient.js`
- Create: `frontend/src/lib/http/tokenStorage.js`
- Create: `frontend/src/lib/http/authApi.js`
- Create: `frontend/src/lib/http/statsApi.js`
- Create: `frontend/src/lib/http/gamesApi.js`
- Create: `frontend/src/lib/query/queryClient.js`

### Shared UI

- Create: `frontend/src/components/layout/AppHeader.jsx`
- Create: `frontend/src/components/layout/PageContainer.jsx`
- Create: `frontend/src/components/common/Button.jsx`
- Create: `frontend/src/components/common/TextField.jsx`
- Create: `frontend/src/components/common/SelectField.jsx`
- Create: `frontend/src/components/common/Banner.jsx`
- Create: `frontend/src/components/common/SegmentedControl.jsx`
- Create: `frontend/src/components/common/StatCard.jsx`
- Create: `frontend/src/components/common/EmptyState.jsx`
- Create: `frontend/src/components/common/LoadingState.jsx`

### Auth Feature

- Create: `frontend/src/features/auth/api/useGoogleLoginMutation.js`
- Create: `frontend/src/features/auth/api/useLogoutMutation.js`
- Create: `frontend/src/features/auth/components/GoogleLoginPanel.jsx`
- Modify: `frontend/src/features/auth/pages/AuthPage.jsx`
- Create: `frontend/src/features/auth/store/AuthSessionProvider.jsx`
- Create: `frontend/src/features/auth/store/useAuthSession.js`

### Records Feature

- Create: `frontend/src/features/records/api/useStatsQuery.js`
- Create: `frontend/src/features/records/components/RecordFilterBar.jsx`
- Create: `frontend/src/features/records/components/RecordSummarySection.jsx`
- Create: `frontend/src/features/records/components/RecordMetricGrid.jsx`
- Create: `frontend/src/features/records/components/RecordStateSection.jsx`
- Create: `frontend/src/features/records/pages/RecordsPage.jsx`
- Create: `frontend/src/features/records/pages/RecordDetailPage.jsx`
- Create: `frontend/src/features/records/utils/recordLabels.js`

### Games Feature

- Create: `frontend/src/features/games/api/useSaveGameMutation.js`
- Create: `frontend/src/features/games/components/GameInfoStep.jsx`
- Create: `frontend/src/features/games/components/BatterRecordStep.jsx`
- Create: `frontend/src/features/games/components/PitcherRecordStep.jsx`
- Create: `frontend/src/features/games/components/RecordTabs.jsx`
- Modify: `frontend/src/features/game/pages/GameEntryPage.jsx`
- Create: `frontend/src/features/games/schema/gameSchemas.js`
- Create: `frontend/src/features/games/utils/gameMappers.js`

### Test Support

- Modify: `frontend/src/test/setup.js`
- Create: `frontend/src/test/renderWithProviders.jsx`
- Create: `frontend/src/test/server.js`
- Create: `frontend/src/test/handlers.js`
- Modify: `frontend/src/App.test.jsx`
- Create: `frontend/src/features/auth/pages/AuthPage.test.jsx`
- Create: `frontend/src/features/records/pages/RecordsPage.test.jsx`
- Create: `frontend/src/features/games/pages/GameEntryPage.test.jsx`
- Create: `frontend/src/lib/http/apiClient.test.js`

## Chunk 1: App Runtime And Routing

### Task 1: 앱 런타임과 보호 라우트를 구성한다

**Files:**
- Modify: `frontend/src/App.jsx`
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/app/providers/AppProviders.jsx`
- Modify: `frontend/src/app/router/AppRouter.jsx`
- Create: `frontend/src/app/router/ProtectedRoute.jsx`
- Create: `frontend/src/app/router/PublicOnlyRoute.jsx`
- Create: `frontend/src/lib/query/queryClient.js`
- Test: `frontend/src/App.test.jsx`

- [ ] **Step 1: 보호 라우트 실패 테스트를 먼저 작성한다**

검증 시나리오:
- 인증 없이 `/records` 접근 시 `/auth`
- 인증 없이 `/games/new` 접근 시 `/auth`
- 세션이 있으면 `/records` 접근 허용

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd frontend && npm run test -- src/App.test.jsx`
Expected: 보호 라우트가 없어 FAIL

- [ ] **Step 3: 최소 라우팅 구조를 구현한다**

반영 내용:
- `/auth`
- `/records`
- `/games/new`
- `ProtectedRoute`
- `PublicOnlyRoute`

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd frontend && npm run test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add frontend/src/App.jsx frontend/src/main.jsx frontend/src/app frontend/src/lib/query frontend/src/App.test.jsx
git commit -m "기능: 보호 라우트와 앱 기본 구조 구성"
```

## Chunk 2: Google Auth Session

### Task 2: Google 로그인 화면과 앱 세션 저장소를 만든다

**Files:**
- Modify: `frontend/src/features/auth/pages/AuthPage.jsx`
- Create: `frontend/src/features/auth/components/GoogleLoginPanel.jsx`
- Create: `frontend/src/features/auth/api/useGoogleLoginMutation.js`
- Create: `frontend/src/features/auth/api/useLogoutMutation.js`
- Create: `frontend/src/features/auth/store/AuthSessionProvider.jsx`
- Create: `frontend/src/features/auth/store/useAuthSession.js`
- Create: `frontend/src/lib/http/tokenStorage.js`
- Create: `frontend/src/lib/http/authApi.js`
- Test: `frontend/src/features/auth/pages/AuthPage.test.jsx`

- [ ] **Step 1: Google 로그인 화면 테스트를 먼저 작성한다**

검증 시나리오:
- `Google로 계속하기` 버튼 노출
- 로그인 성공 시 `/records` 이동
- 로그인 실패 시 상단 에러 배너

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd frontend && npm run test -- src/features/auth/pages/AuthPage.test.jsx`
Expected: Google auth flow가 없어 FAIL

- [ ] **Step 3: 인증 화면과 세션 저장을 구현한다**

반영 내용:
- 단일 Google 로그인 패널
- token storage
- auth session provider
- logout mutation

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd frontend && npm run test -- src/features/auth/pages/AuthPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add frontend/src/features/auth frontend/src/lib/http
git commit -m "기능: 구글 로그인과 앱 세션 관리 구현"
```

## Chunk 3: Records Screen

### Task 3: 기록 확인 요약 화면과 상세 기록 화면의 조회 상태를 구현한다

**Files:**
- Create: `frontend/src/features/records/api/useStatsQuery.js`
- Create: `frontend/src/features/records/components/RecordFilterBar.jsx`
- Create: `frontend/src/features/records/components/RecordSummarySection.jsx`
- Create: `frontend/src/features/records/components/RecordMetricGrid.jsx`
- Create: `frontend/src/features/records/components/RecordStateSection.jsx`
- Create: `frontend/src/features/records/pages/RecordsPage.jsx`
- Create: `frontend/src/features/records/utils/recordLabels.js`
- Create: `frontend/src/lib/http/statsApi.js`
- Test: `frontend/src/features/records/pages/RecordsPage.test.jsx`

- [ ] **Step 1: 기록 화면 테스트를 먼저 작성한다**

검증 시나리오:
- 빈 상태 응답 렌더링
- summary 우선 렌더링
- `기록 보기` 진입
- 상세 기록 화면 필터 렌더링
- 조회 실패 상태
- 세션 만료 상태
- `경기 추가` 버튼 노출

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd frontend && npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: records feature가 없어 FAIL

- [ ] **Step 3: 기록 요약 화면과 상세 기록 화면을 최소 구현한다**

반영 내용:
- `scope`, `recordType`, `gameFilter` 상태
- 요약 화면 렌더링
- 상세 기록 화면 렌더링
- empty/loading/error/session expired UI

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd frontend && npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add frontend/src/features/records frontend/src/lib/http/statsApi.js
git commit -m "기능: 기록 요약 화면과 상세 기록 화면 구현"
```

## Chunk 4: Atomic Save Flow

### Task 4: 경기 정보 입력 단계와 기록 입력 단계를 구현한다

**Files:**
- Modify: `frontend/src/features/game/pages/GameEntryPage.jsx`
- Create: `frontend/src/features/games/components/GameInfoStep.jsx`
- Create: `frontend/src/features/games/components/BatterRecordStep.jsx`
- Create: `frontend/src/features/games/components/PitcherRecordStep.jsx`
- Create: `frontend/src/features/games/components/RecordTabs.jsx`
- Create: `frontend/src/features/games/schema/gameSchemas.js`
- Create: `frontend/src/features/games/utils/gameMappers.js`
- Create: `frontend/src/features/games/api/useSaveGameMutation.js`
- Create: `frontend/src/lib/http/gamesApi.js`
- Test: `frontend/src/features/games/pages/GameEntryPage.test.jsx`

- [ ] **Step 1: 단계형 입력 테스트를 먼저 작성한다**

검증 시나리오:
- 1단계에서 `다음`
- 2단계에서 `뒤로`, `저장`
- 탭 전환 시 값 유지
- 이탈 경고
- 저장 실패 시 값 유지

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd frontend && npm run test -- src/features/games/pages/GameEntryPage.test.jsx`
Expected: 단계형 저장 흐름이 없어 FAIL

- [ ] **Step 3: 최소 입력 흐름을 구현한다**

반영 내용:
- step state
- batter/pitcher tabs
- react-hook-form + zod
- atomic save mutation

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd frontend && npm run test -- src/features/games/pages/GameEntryPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add frontend/src/features/game frontend/src/features/games frontend/src/lib/http/gamesApi.js
git commit -m "기능: 경기 단계형 입력과 원자적 저장 구현"
```

## Chunk 5: Session Recovery And Error UX

### Task 5: 세션 만료, 저장 실패, 조회 실패 복구 흐름을 구현한다

**Files:**
- Modify: `frontend/src/lib/http/apiClient.js`
- Modify: `frontend/src/features/records/pages/RecordsPage.jsx`
- Modify: `frontend/src/features/game/pages/GameEntryPage.jsx`
- Modify: `frontend/src/features/auth/pages/AuthPage.jsx`
- Test: `frontend/src/lib/http/apiClient.test.js`
- Test: `frontend/src/features/records/pages/RecordsPage.test.jsx`
- Test: `frontend/src/features/games/pages/GameEntryPage.test.jsx`

- [ ] **Step 1: 세션 만료 복구 테스트를 먼저 작성한다**

검증 시나리오:
- `401 SESSION_EXPIRED` 시 refresh 시도
- refresh 실패 시 `/auth`
- 저장 실패 후 재시도 버튼
- 조회 실패 후 다시 시도 버튼

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd frontend && npm run test -- src/lib/http/apiClient.test.js src/features/records/pages/RecordsPage.test.jsx src/features/games/pages/GameEntryPage.test.jsx`
Expected: recovery flow가 없어 FAIL

- [ ] **Step 3: recovery 흐름을 구현한다**

반영 내용:
- refresh interceptor
- session expiry redirect
- retry actions
- disabled/loading states

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd frontend && npm run test -- src/lib/http/apiClient.test.js src/features/records/pages/RecordsPage.test.jsx src/features/games/pages/GameEntryPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add frontend/src/lib/http frontend/src/features/auth frontend/src/features/records frontend/src/features/game
git commit -m "기능: 세션 만료와 오류 복구 흐름 구현"
```

## Rewrite Note

이 문서는 기존 `docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`를 대체하기 위해 작성했다.
기존 문서는 아래 이유로 현재 기준과 맞지 않는다.

- 이메일/비밀번호 인증 전제
- old backend plan endpoint 직접 의존
- empty/home/auth 개념 혼합
- mobile non-happy-path 상태 부족
