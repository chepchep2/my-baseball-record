# Milestone 1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오 로그인 진입, 기록 0건 리다이렉트, 단일 홈 화면, 4단계 경기 입력 플로우를 갖는 Milestone 1 프론트엔드를 구현한다.

**Architecture:** 기존 Next App Router 구조를 유지하되, 구글 로그인과 탭형 기록 UI를 Milestone 1 전용 인증/홈/입력 흐름으로 교체한다. 홈 화면은 시즌/통산 요약과 최근 경기 2개만 보여주고, 입력 플로우는 클라이언트 상태 기반 4단계 위저드로 구현한다. 기록 생성 payload는 현재 `POST /api/games` 계약에 맞춰 변환하되, 최근 경기 리스트와 카카오 인증은 얇은 adapter 계층으로 감싸 추후 백엔드 계약 변경을 흡수한다.

**Tech Stack:** Next.js 15 App Router, React 19, Vitest, Testing Library, existing auth session/api client utilities

---

## Assumptions And Dependencies

- 카카오 로그인 백엔드 엔드포인트는 `/api/auth/kakao` 또는 동등한 session 발급 API로 제공된다고 가정한다.
- 최근 경기 2개 조회 전용 백엔드 API는 아직 명시되지 않았으므로, 이 계획에서는 `frontend/src/features/home/api/home-api.js`에 최근 경기 source를 분리한다.
  - 1차 구현은 fixture 또는 임시 adapter로 UI를 먼저 완성한다.
  - 백엔드 계약이 정해지면 source 함수만 교체한다.
- `POST /api/games`는 기존 계약을 유지하고, Milestone 1 입력값 6개만 채운 payload도 허용한다고 가정한다.

## File Structure

### Create

- `frontend/src/features/auth/kakao/kakao-auth.js`
  - 카카오 로그인 SDK 또는 OAuth 진입 helper를 감싼다.
- `frontend/src/features/auth/kakao/__tests__/kakao-auth.test.js`
  - 카카오 로그인 bootstrap helper 테스트.
- `frontend/src/features/home/api/home-api.js`
  - 홈 화면이 필요한 summary/recent data를 한 번에 조립하는 adapter.
- `frontend/src/features/home/api/__tests__/home-api.test.js`
  - 홈 API adapter 테스트.
- `frontend/src/features/home/model/home-view-model.js`
  - 시즌/통산 탭, 지표 5개, 최근 경기 2개를 렌더링용 shape로 변환.
- `frontend/src/features/home/model/__tests__/home-view-model.test.js`
  - 홈 view model 테스트.
- `frontend/src/features/entry/model/entry-form.js`
  - Milestone 1 입력 상태 기본값, 시간 올림, step metadata를 제공.
- `frontend/src/features/entry/model/__tests__/entry-form.test.js`
  - 기본값/시간 올림 로직 테스트.
- `frontend/src/features/entry/model/entry-validation.js`
  - 단계별 검증 및 최종 검증 함수.
- `frontend/src/features/entry/model/__tests__/entry-validation.test.js`
  - 단계별 즉시 검증/최종 검증 테스트.
- `frontend/src/features/entry/model/entry-payload.js`
  - 6개 입력값을 현재 `POST /api/games` payload로 변환.
- `frontend/src/features/entry/model/__tests__/entry-payload.test.js`
  - payload 변환 테스트.
- `frontend/src/features/entry/components/EntryFlowClient.jsx`
  - 4단계 입력 플로우 상위 client component.
- `frontend/src/features/entry/components/EntryStepDateTime.jsx`
  - Step 1 날짜/시간 입력.
- `frontend/src/features/entry/components/EntryCalendarSheet.jsx`
  - 바텀시트 달력 UI.
- `frontend/src/features/entry/components/EntryStepCounts.jsx`
  - Step 2~4의 공통 2칸 숫자 입력 UI.
- `frontend/src/features/entry/components/EntryExitModal.jsx`
  - 첫 단계 이탈 확인 모달.
- `frontend/src/features/entry/components/__tests__/EntryFlowClient.test.jsx`
  - 4단계 진행, 검증, 저장, 뒤로가기 테스트.
- `frontend/src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx`
  - 바텀시트 달력 표시/연월 전환 테스트.

### Modify

- `frontend/src/app/providers/AppProviders.jsx`
  - `BrowserRouter` 제거, Next App Router와 충돌하는 provider 정리.
- `frontend/src/app/auth/page.jsx`
  - 구글 로그인 UI를 카카오 로그인 UI/흐름으로 교체.
- `frontend/src/features/auth/api/auth-api.js`
  - 카카오 로그인 session 발급 호출 추가 또는 기존 구글 login 대체.
- `frontend/src/features/auth/session/AuthSessionContext.jsx`
  - 카카오 로그인용 session action 이름/메시지/redirect 흐름 정리.
- `frontend/src/app/page.jsx`
  - 기본 진입 redirect 정책 재검토.
- `frontend/src/app/home/page.jsx`
  - 단일 홈 화면 server entry를 Milestone 1 home client로 연결.
- `frontend/src/components/home/HomePageClient.jsx`
  - 타자/투수 탭형 홈을 시즌/통산 + 최근 경기 2개 홈으로 교체.
- `frontend/src/components/home/__tests__/HomePageClient.test.jsx`
  - 홈 UI 회귀 테스트를 새 화면 기준으로 교체.
- `frontend/src/app/games/new/page.jsx`
  - 기존 `GameForm` 대신 Milestone 1 `EntryFlowClient` 연결.
- `frontend/src/components/navigation/BottomTabBar.jsx`
  - Milestone 1 구조에 맞춰 하단 탭 유지 여부 조정 또는 제거.
- `frontend/src/components/layout/AppPageLayout.jsx`
  - 홈/입력 화면에서 탭 유무와 모바일 frame 정책 조정.
- `frontend/src/app/globals.css`
  - 홈 화면, 바텀시트, 입력 4단계, 플로팅 버튼, 모달 스타일 추가.
- `frontend/src/features/games/api/games-api.js`
  - 생성 응답을 Milestone 1 홈 갱신 흐름에 맞게 재사용 가능하도록 유지.

### Delete Or Stop Using

- `frontend/src/lib/GameForm.jsx`
  - Milestone 1 create flow에서는 더 이상 사용하지 않는다.
- `frontend/src/lib/game-draft.js`
  - Milestone 1 입력 플로우에서는 사용하지 않는다. 완전 삭제 여부는 구현 중 판단.
- `frontend/src/lib/game-form-data.js`
  - Milestone 1 create flow에서는 사용하지 않는다. 기존 edit/detail과 결합돼 있으면 제거 대신 참조 중단.

---

## Chunk 1: Auth And Home Foundation

### Task 1: Remove Router Mismatch And Prepare Auth Surface

**Files:**
- Modify: `frontend/src/app/providers/AppProviders.jsx`
- Modify: `frontend/src/features/auth/api/auth-api.js`
- Modify: `frontend/src/features/auth/session/AuthSessionContext.jsx`
- Create: `frontend/src/features/auth/kakao/kakao-auth.js`
- Create: `frontend/src/features/auth/kakao/__tests__/kakao-auth.test.js`
- Test: `frontend/src/features/auth/session/__tests__/auth-session-context.test.jsx`

- [ ] **Step 1: Read current auth/session files and note Google-specific branches that must be renamed or removed**

Read:
- `frontend/src/app/auth/page.jsx`
- `frontend/src/features/auth/api/auth-api.js`
- `frontend/src/features/auth/session/AuthSessionContext.jsx`

Expected:
- 현재 Google 전용 로직과 에러 코드 매핑 위치를 파악한다.

- [ ] **Step 2: Write the failing Kakao auth helper test**

Create test in `frontend/src/features/auth/kakao/__tests__/kakao-auth.test.js` covering:
- SDK 미주입 시 실패 메시지
- 성공 callback wiring
- 중복 mount 방지 또는 cleanup

Run:
```bash
cd frontend && npm run test -- src/features/auth/kakao/__tests__/kakao-auth.test.js
```
Expected: FAIL because helper file does not exist.

- [ ] **Step 3: Implement minimal Kakao auth helper**

Create `frontend/src/features/auth/kakao/kakao-auth.js` with:
- `mountKakaoLoginButton({ element, onSuccess, onError })`
- SDK 유무 체크
- cleanup 반환 또는 idempotent guard

- [ ] **Step 4: Run Kakao auth helper test**

Run:
```bash
cd frontend && npm run test -- src/features/auth/kakao/__tests__/kakao-auth.test.js
```
Expected: PASS.

- [ ] **Step 5: Replace BrowserRouter provider with plain provider wrapper**

Modify `frontend/src/app/providers/AppProviders.jsx` so it no longer mounts `BrowserRouter`.

Run:
```bash
cd frontend && npm run test -- src/features/auth/session/__tests__/auth-session-context.test.jsx
```
Expected: existing auth session tests still pass or fail only on auth API renames.

- [ ] **Step 6: Add Kakao login API function and adapt session context**

Modify:
- `frontend/src/features/auth/api/auth-api.js`
- `frontend/src/features/auth/session/AuthSessionContext.jsx`

Implement:
- `loginWithKakao(codeOrToken, fetchImpl)`
- session context action rename to provider-agnostic form, e.g. `loginWithProviderToken`
- Kakao-specific auth error message mapping

- [ ] **Step 7: Update and run auth session tests**

Run:
```bash
cd frontend && npm run test -- src/features/auth/session/__tests__/auth-session-context.test.jsx
```
Expected: PASS with Kakao login naming/behavior.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/providers/AppProviders.jsx frontend/src/features/auth/api/auth-api.js frontend/src/features/auth/session/AuthSessionContext.jsx frontend/src/features/auth/kakao
git commit -m "refactor/auth: 카카오 로그인 기반 인증 흐름을 준비하기 위해 AppProviders와 AuthSessionContext를 수정하였습니다"
```

### Task 2: Rebuild Auth Page For Kakao Entry

**Files:**
- Modify: `frontend/src/app/auth/page.jsx`
- Test: `frontend/src/app/auth/page.jsx`
- Possibly Modify: `frontend/src/app/page.jsx`

- [ ] **Step 1: Write auth page behavior test or extend existing auth page coverage**

Add tests covering:
- 카카오 로그인 버튼 문구 노출
- 인증 완료 시 `/home` 또는 next path redirect
- 0건 여부 판단은 auth page가 아니라 home/entry gate에서 처리함

If no existing auth page test file exists, create:
- `frontend/src/app/auth/__tests__/auth-page.test.jsx`

Run:
```bash
cd frontend && npm run test -- src/app/auth/__tests__/auth-page.test.jsx
```
Expected: FAIL because page still renders Google UI.

- [ ] **Step 2: Replace Google UI with Kakao login UI**

Modify `frontend/src/app/auth/page.jsx` to:
- 서비스 소개 문구 표시
- 카카오 로그인 CTA 표시
- current session authenticated 시 next path redirect 유지
- local error banner 유지

- [ ] **Step 3: Run auth page test**

Run:
```bash
cd frontend && npm run test -- src/app/auth/__tests__/auth-page.test.jsx
```
Expected: PASS.

- [ ] **Step 4: Verify root redirect remains stable**

Run:
```bash
cd frontend && npm run test -- src/app/auth/__tests__/auth-page.test.jsx src/features/auth/session/__tests__/auth-session-context.test.jsx
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/page.jsx frontend/src/app/auth/page.jsx frontend/src/app/auth/__tests__/auth-page.test.jsx
git commit -m "feat/auth: 카카오 로그인 진입 화면을 제공하기 위해 auth page를 수정하였습니다"
```

### Task 3: Build Home Data Adapter And View Model

**Files:**
- Create: `frontend/src/features/home/api/home-api.js`
- Create: `frontend/src/features/home/api/__tests__/home-api.test.js`
- Create: `frontend/src/features/home/model/home-view-model.js`
- Create: `frontend/src/features/home/model/__tests__/home-view-model.test.js`
- Modify: `frontend/src/features/stats/api/stats-api.js`

- [ ] **Step 1: Write failing home view model tests**

Cover:
- `올해 시즌 / 통산` 탭 label
- 5개 지표 shape
- 최근 경기 최대 2개 trimming
- zero-record flag passthrough

Run:
```bash
cd frontend && npm run test -- src/features/home/model/__tests__/home-view-model.test.js
```
Expected: FAIL because model file does not exist.

- [ ] **Step 2: Implement home view model**

Create `frontend/src/features/home/model/home-view-model.js` with pure functions:
- `toHomeSummaryItems`
- `toRecentGameItems`
- `toHomeViewModel`

- [ ] **Step 3: Run home view model test**

Run:
```bash
cd frontend && npm run test -- src/features/home/model/__tests__/home-view-model.test.js
```
Expected: PASS.

- [ ] **Step 4: Write failing home API adapter tests**

Create tests for `home-api.js` covering:
- current season stats fetch
- career stats fetch
- recent games source composition
- zero-record user shortcut

Run:
```bash
cd frontend && npm run test -- src/features/home/api/__tests__/home-api.test.js
```
Expected: FAIL because adapter file does not exist.

- [ ] **Step 5: Implement minimal home API adapter**

Create `frontend/src/features/home/api/home-api.js`:
- fetch season stats via existing stats API
- fetch career stats via existing stats API
- fetch recent games via isolated source function (temporary fixture adapter allowed)
- return unified home view model

- [ ] **Step 6: Run home API adapter tests**

Run:
```bash
cd frontend && npm run test -- src/features/home/api/__tests__/home-api.test.js
```
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/features/home/api frontend/src/features/home/model frontend/src/features/stats/api/stats-api.js
git commit -m "feat/home: 단일 홈 화면 데이터를 조립하기 위해 home adapter와 view model을 추가하였습니다"
```

## Chunk 2: Home Screen And Entry Flow

### Task 4: Replace Home Screen With Milestone 1 Dashboard

**Files:**
- Modify: `frontend/src/app/home/page.jsx`
- Modify: `frontend/src/components/home/HomePageClient.jsx`
- Modify: `frontend/src/components/home/__tests__/HomePageClient.test.jsx`
- Modify: `frontend/src/components/layout/AppPageLayout.jsx`
- Modify: `frontend/src/components/navigation/BottomTabBar.jsx`
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Rewrite HomePageClient tests to the new screen contract**

Cover:
- season/career tab rendering
- 5개 지표 표시
- 최근 경기 최대 2개 표시
- 0건이면 `/games/new` redirect 또는 input gate 호출
- 최근 경기 카드 탭 동작 없음

Run:
```bash
cd frontend && npm run test -- src/components/home/__tests__/HomePageClient.test.jsx
```
Expected: FAIL because current home still shows batter/pitcher tabs.

- [ ] **Step 2: Implement new home page client**

Modify `frontend/src/components/home/HomePageClient.jsx` to:
- remove batter/pitcher tabs
- use `home-api.js`
- render season/career tabs
- render 5 metrics card
- render recent games max 2
- route 0-record users to `/games/new`

- [ ] **Step 3: Adjust page shell and navigation**

Modify:
- `frontend/src/components/layout/AppPageLayout.jsx`
- `frontend/src/components/navigation/BottomTabBar.jsx`

Implement:
- layout support for floating action button
- milestone-1 compatible tab or no-tab policy
- remove “생성/경기/기록” assumptions that conflict with single-home IA

- [ ] **Step 4: Add CSS for single-screen home**

Modify `frontend/src/app/globals.css` with:
- header tab styles
- metrics card styles
- recent list styles
- floating `+` button styles

- [ ] **Step 5: Run home tests**

Run:
```bash
cd frontend && npm run test -- src/components/home/__tests__/HomePageClient.test.jsx src/features/home/api/__tests__/home-api.test.js src/features/home/model/__tests__/home-view-model.test.js
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/home/page.jsx frontend/src/components/home/HomePageClient.jsx frontend/src/components/home/__tests__/HomePageClient.test.jsx frontend/src/components/layout/AppPageLayout.jsx frontend/src/components/navigation/BottomTabBar.jsx frontend/src/app/globals.css
git commit -m "feat/home: 시즌 통산 단일 홈 화면을 제공하기 위해 HomePageClient와 레이아웃을 수정하였습니다"
```

### Task 5: Build Entry State, Validation, And Payload Models

**Files:**
- Create: `frontend/src/features/entry/model/entry-form.js`
- Create: `frontend/src/features/entry/model/__tests__/entry-form.test.js`
- Create: `frontend/src/features/entry/model/entry-validation.js`
- Create: `frontend/src/features/entry/model/__tests__/entry-validation.test.js`
- Create: `frontend/src/features/entry/model/entry-payload.js`
- Create: `frontend/src/features/entry/model/__tests__/entry-payload.test.js`

- [ ] **Step 1: Write failing entry form default tests**

Cover:
- 기본 step `1 / 4`
- 오늘 날짜 default
- 현재 시각의 다음 10분 단위 올림
- 빈 입력값 0 처리 helper

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-form.test.js
```
Expected: FAIL because model file does not exist.

- [ ] **Step 2: Implement entry form model**

Create `entry-form.js` with pure utilities:
- `buildEntryDraft(now)`
- `roundUpToNextTenMinutes(date)`
- `getEntrySteps()`

- [ ] **Step 3: Run entry form tests**

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-form.test.js
```
Expected: PASS.

- [ ] **Step 4: Write failing validation tests**

Cover:
- 타석 < 사사구
- 타석 = 사사구 then hits must stay 0
- hit sum > atBats
- valid next-step progression

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-validation.test.js
```
Expected: FAIL.

- [ ] **Step 5: Implement validation model**

Create `entry-validation.js` with:
- `validateStep1`
- `validateStep2`
- `validateStep3`
- `validateStep4`
- `validateEntrySubmission`

- [ ] **Step 6: Run validation tests**

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-validation.test.js
```
Expected: PASS.

- [ ] **Step 7: Write failing payload transform tests**

Cover:
- 6개 입력값 -> current `/api/games` payload transform
- missing optional fields null/0 handling
- playedAt date/time formatting

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-payload.test.js
```
Expected: FAIL.

- [ ] **Step 8: Implement payload transform**

Create `entry-payload.js` to map:
- date + time -> `playedAt` (or chosen contract shape if backend updates)
- batter fields to `plateAppearances`, `walks`/`hitByPitch` combined rule per current agreed meaning
- optional fields omitted

- [ ] **Step 9: Run payload tests**

Run:
```bash
cd frontend && npm run test -- src/features/entry/model/__tests__/entry-payload.test.js
```
Expected: PASS.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/features/entry/model
git commit -m "feat/entry: 4단계 입력 상태와 검증 규칙을 분리하기 위해 entry model을 추가하였습니다"
```

### Task 6: Implement 4-Step Entry Flow UI

**Files:**
- Create: `frontend/src/features/entry/components/EntryFlowClient.jsx`
- Create: `frontend/src/features/entry/components/EntryStepDateTime.jsx`
- Create: `frontend/src/features/entry/components/EntryCalendarSheet.jsx`
- Create: `frontend/src/features/entry/components/EntryStepCounts.jsx`
- Create: `frontend/src/features/entry/components/EntryExitModal.jsx`
- Create: `frontend/src/features/entry/components/__tests__/EntryFlowClient.test.jsx`
- Create: `frontend/src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx`
- Modify: `frontend/src/app/games/new/page.jsx`
- Modify: `frontend/src/app/globals.css`

- [ ] **Step 1: Write failing entry flow integration tests**

Cover:
- 0건 사용자 진입 시 첫 step 렌더링
- 1/4 -> 4/4 step progression
- step error 시 버튼 비활성화
- first-step back exit modal
- successful submit routes to `/home`

Run:
```bash
cd frontend && npm run test -- src/features/entry/components/__tests__/EntryFlowClient.test.jsx
```
Expected: FAIL because flow UI does not exist.

- [ ] **Step 2: Implement EntryStepDateTime and calendar sheet**

Create:
- `EntryStepDateTime.jsx`
- `EntryCalendarSheet.jsx`

Implement:
- 날짜 field + bottom sheet month grid
- year/month header trigger
- time dropdowns

- [ ] **Step 3: Implement EntryStepCounts and exit modal**

Create:
- `EntryStepCounts.jsx`
- `EntryExitModal.jsx`

Implement:
- shared two-column numeric inputs
- inline validation banner
- disabled next/save button
- fixed modal copy from spec

- [ ] **Step 4: Implement EntryFlowClient orchestration**

Create `EntryFlowClient.jsx` with:
- `currentStep`
- `draft`
- `isDirty`
- `validationErrors`
- OS/back gesture handling through history/popstate-safe logic
- final submit calling `createGame`

- [ ] **Step 5: Replace `/games/new` page**

Modify `frontend/src/app/games/new/page.jsx` to render `EntryFlowClient`.

- [ ] **Step 6: Add CSS for entry flow**

Modify `frontend/src/app/globals.css`:
- step header
- two-column fields
- bottom sheet
- modal
- inline error
- disabled CTA

- [ ] **Step 7: Run entry flow tests**

Run:
```bash
cd frontend && npm run test -- src/features/entry/components/__tests__/EntryFlowClient.test.jsx src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx src/features/entry/model/__tests__/entry-validation.test.js src/features/entry/model/__tests__/entry-payload.test.js
```
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/app/games/new/page.jsx frontend/src/features/entry frontend/src/app/globals.css
git commit -m "feat/entry: 모바일 4단계 경기 기록 입력 흐름을 구현하기 위해 EntryFlowClient를 추가하였습니다"
```

### Task 7: Wire Submit, Home Refresh, And Remove Obsolete Create Flow

**Files:**
- Modify: `frontend/src/features/games/api/games-api.js`
- Modify: `frontend/src/components/home/HomePageClient.jsx`
- Modify: `frontend/src/lib/GameForm.jsx`
- Modify: `frontend/src/lib/game-draft.js`
- Modify: `frontend/src/lib/game-form-data.js`
- Test: `frontend/src/features/games/api/__tests__/games-api.test.js`

- [ ] **Step 1: Write or update tests for create flow integration**

Cover:
- create success returns usable summary payload
- home refresh after create
- obsolete draft functions are no longer used by `/games/new`

Run:
```bash
cd frontend && npm run test -- src/features/games/api/__tests__/games-api.test.js src/features/entry/components/__tests__/EntryFlowClient.test.jsx
```
Expected: FAIL until entry submit is wired end-to-end.

- [ ] **Step 2: Wire create submission to existing games API**

Modify:
- `frontend/src/features/games/api/games-api.js`
- `frontend/src/features/entry/components/EntryFlowClient.jsx` (if needed)

Implement:
- create returns result usable for home refresh/redirect
- redirect target `/home`

- [ ] **Step 3: Stop using old GameForm create path**

Modify:
- `frontend/src/lib/GameForm.jsx`
- `frontend/src/lib/game-draft.js`
- `frontend/src/lib/game-form-data.js`

Implement:
- mark as legacy for edit flow only, or delete create references
- ensure `/games/new` no longer imports legacy GameForm

- [ ] **Step 4: Run focused regression suite**

Run:
```bash
cd frontend && npm run test -- src/app/auth/__tests__/auth-page.test.jsx src/components/home/__tests__/HomePageClient.test.jsx src/features/entry/components/__tests__/EntryFlowClient.test.jsx src/features/games/api/__tests__/games-api.test.js src/features/stats/api/__tests__/stats-api.test.js
```
Expected: PASS.

- [ ] **Step 5: Run full frontend test suite**

Run:
```bash
cd frontend && npm run test
```
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/games/api/games-api.js frontend/src/components/home/HomePageClient.jsx frontend/src/lib/GameForm.jsx frontend/src/lib/game-draft.js frontend/src/lib/game-form-data.js
git commit -m "refactor/entry: 기존 게임 생성 폼 의존성을 제거하기 위해 create flow 연결부를 정리하였습니다"
```

---

## Notes For The Implementer

- `frontend/src/lib/GameForm.jsx`는 edit/detail에 엮여 있으므로, 처음부터 무조건 삭제하지 말고 `/games/new`에서만 분리하는 것이 안전하다.
- `recent games`는 지금 백엔드 계약이 없으므로 UI와 adapter 경계를 먼저 만들고 fixture source로 닫는 편이 안전하다.
- `walks + hitByPitch = 사사구` 해석은 payload 변환에서 명시적으로 처리해야 한다.
- 바텀시트 달력은 접근성 속성(`role="dialog"`, focus handling)까지 포함해 구현한다.
- 브라우저 뒤로가기 처리에는 `popstate` 또는 history state push 전략이 필요하다. 직접 구현 전 간단한 spike를 권장한다.

## Execution Handoff

Plan complete and saved to `docs/milestone-1/2026-03-26-frontend-implementation-plan.md`. Ready to execute?
