# Frontend Backend API Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 UI와 Google 로그인 흐름을 유지한 채, 프론트엔드를 백엔드 `auth / stats / games` API와 단계적으로 연동한다.

**Architecture:** 인증 세션과 공통 HTTP 클라이언트는 현재 `features/auth`와 `lib/http` 구조를 재사용한다. 화면 레이아웃과 스타일은 변경하지 않고, 각 페이지 엔트리와 페이지 클라이언트에서 mock 데이터를 API 응답으로 치환한다. 브랜치는 `stats -> game detail -> games write` 순서로 나누고, 각 브랜치는 독립적으로 push 가능한 상태를 만든다.

**Tech Stack:** Next.js 15, React 19, fetch API, Vitest, Testing Library

---

## Scope Guardrails

- UI 레이아웃과 스타일은 수정하지 않는다.
- Google 로그인 UX와 버튼 동작은 수정하지 않는다.
- 인증 기반은 필요한 최소 보정만 허용한다.
- 모든 작업 브랜치는 `feat/...` 형식을 사용한다.
- 브랜치명과 커밋 메시지는 한글로 작성한다.
- 각 브랜치는 `develop` 기준으로 분리하고, 사용자가 직접 push 및 PR 생성 후 merge한다.

## Branch Plan

1. `feat/기록-api-연동`
2. `feat/개별-경기-상세-api-연동`
3. `feat/경기-쓰기-api-연동`

## File Structure

- Modify: `frontend/src/lib/http/api-client.js`
- Create: `frontend/src/features/stats/api/stats-api.js`
- Create: `frontend/src/features/stats/model/stats-view-model.js`
- Modify: `frontend/src/components/records/RecordsPageClient.jsx`
- Modify: `frontend/src/app/records/page.jsx`
- Create: `frontend/src/features/stats/api/__tests__/stats-api.test.js`
- Create: `frontend/src/components/records/__tests__/RecordsPageClient.test.jsx`
- Create: `frontend/src/features/games/api/games-api.js`
- Create: `frontend/src/features/games/model/game-detail-view-model.js`
- Modify: `frontend/src/app/games/[gameId]/page.jsx`
- Modify: `frontend/src/components/games/GameDetailView.jsx`
- Create: `frontend/src/features/games/api/__tests__/games-api.test.js`
- Create: `frontend/src/components/games/__tests__/GameDetailView.test.jsx`
- Create: `frontend/src/features/games/model/game-form-payload.js`
- Modify: `frontend/src/lib/GameForm.jsx`
- Modify: `frontend/src/app/games/new/page.jsx`
- Modify: `frontend/src/app/games/[gameId]/edit/page.jsx`
- Create: `frontend/src/lib/__tests__/GameForm.test.jsx`

## Chunk 1: Stats API Integration

### Task 1: 공통 API 호출 정합성 확인 및 최소 보정

**Files:**
- Modify: `frontend/src/lib/http/api-client.js`
- Test: `frontend/src/lib/http/__tests__/api-client.test.js`

- [ ] **Step 1: `api-client`가 백엔드 base URL 규칙을 재사용하는지 확인**
- [ ] **Step 2: 필요한 경우 최소 구현 추가**
- [ ] **Step 3: 테스트 실행**

Run: `cd frontend && npm run test -- api-client`
Expected: PASS

- [ ] **Step 4: 커밋**

```bash
git add frontend/src/lib/http/api-client.js frontend/src/lib/http/__tests__/api-client.test.js
git commit -m "feat: 공통 API 클라이언트 백엔드 주소 정합성 맞춤"
```

### Task 2: Stats API 어댑터와 변환기 추가

**Files:**
- Create: `frontend/src/features/stats/api/stats-api.js`
- Create: `frontend/src/features/stats/model/stats-view-model.js`
- Test: `frontend/src/features/stats/api/__tests__/stats-api.test.js`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: `GET /api/stats` 어댑터 구현**
- [ ] **Step 3: view model 변환기 구현**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- stats-api`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/features/stats/api/stats-api.js frontend/src/features/stats/model/stats-view-model.js frontend/src/features/stats/api/__tests__/stats-api.test.js
git commit -m "feat: 기록 조회 API 어댑터와 변환기 추가"
```

### Task 3: Records 화면을 stats API로 전환

**Files:**
- Modify: `frontend/src/components/records/RecordsPageClient.jsx`
- Modify: `frontend/src/app/records/page.jsx`
- Test: `frontend/src/components/records/__tests__/RecordsPageClient.test.jsx`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: query param -> API query 매핑 구현**
- [ ] **Step 3: 응답 성공, 빈 상태, 실패 상태 렌더링 구현**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- RecordsPageClient`
Expected: PASS

- [ ] **Step 5: 브랜치 검증**

Run: `cd frontend && npm run lint`
Expected: PASS

Run: `cd frontend && npm run build`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/components/records/RecordsPageClient.jsx frontend/src/app/records/page.jsx frontend/src/components/records/__tests__/RecordsPageClient.test.jsx
git commit -m "feat: 기록 화면 stats API 연동"
```

## Chunk 2: Game Detail API Integration

### Task 4: 개별 경기 상세 API 어댑터와 변환기 추가

**Files:**
- Create: `frontend/src/features/games/api/games-api.js`
- Create: `frontend/src/features/games/model/game-detail-view-model.js`
- Test: `frontend/src/features/games/api/__tests__/games-api.test.js`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: `GET /api/games/{id}` 어댑터 구현**
- [ ] **Step 3: `gameInfo` 중첩 응답을 현재 상세 화면 shape로 변환**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- games-api`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/features/games/api/games-api.js frontend/src/features/games/model/game-detail-view-model.js frontend/src/features/games/api/__tests__/games-api.test.js
git commit -m "feat: 개별 경기 상세 API 어댑터 추가"
```

### Task 5: 개별 경기 상세 화면을 detail API로 전환

**Files:**
- Modify: `frontend/src/app/games/[gameId]/page.jsx`
- Modify: `frontend/src/components/games/GameDetailView.jsx`
- Test: `frontend/src/components/games/__tests__/GameDetailView.test.jsx`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: 상세 응답 렌더링과 없는 경기 처리 구현**
- [ ] **Step 3: batter/pitcher 토글 유지 확인**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- GameDetailView`
Expected: PASS

- [ ] **Step 5: 브랜치 검증**

Run: `cd frontend && npm run lint`
Expected: PASS

Run: `cd frontend && npm run build`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/app/games/[gameId]/page.jsx frontend/src/components/games/GameDetailView.jsx frontend/src/components/games/__tests__/GameDetailView.test.jsx
git commit -m "feat: 개별 경기 상세 화면 API 연동"
```

## Chunk 3: Games Write Integration

### Task 6: 생성/수정 payload 변환기 추가

**Files:**
- Create: `frontend/src/features/games/model/game-form-payload.js`
- Test: `frontend/src/lib/__tests__/GameForm.test.jsx`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: create/update payload 변환기 구현**
- [ ] **Step 3: 수정 불가 필드 보호 확인**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- GameForm`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/features/games/model/game-form-payload.js frontend/src/lib/__tests__/GameForm.test.jsx
git commit -m "feat: 경기 입력 payload 변환기 추가"
```

### Task 7: 경기 생성/수정 연동

**Files:**
- Modify: `frontend/src/lib/GameForm.jsx`
- Modify: `frontend/src/app/games/new/page.jsx`
- Modify: `frontend/src/app/games/[gameId]/edit/page.jsx`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: `POST /api/games`, `PUT /api/games/{id}` 연동**
- [ ] **Step 3: 서버 validation error 표시와 draft 삭제 유지**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- GameForm`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add frontend/src/lib/GameForm.jsx frontend/src/app/games/new/page.jsx frontend/src/app/games/[gameId]/edit/page.jsx frontend/src/lib/__tests__/GameForm.test.jsx
git commit -m "feat: 경기 생성 수정 API 연동"
```

### Task 8: 경기 삭제 연동

**Files:**
- Modify: `frontend/src/components/games/GameDetailView.jsx`
- Modify: `frontend/src/features/games/api/games-api.js`
- Test: `frontend/src/components/games/__tests__/GameDetailView.test.jsx`

- [ ] **Step 1: failing test 작성**
- [ ] **Step 2: `DELETE /api/games/{id}` 연동**
- [ ] **Step 3: 성공 시 이동, 실패 시 에러 표시 구현**
- [ ] **Step 4: 테스트 실행**

Run: `cd frontend && npm run test -- GameDetailView`
Expected: PASS

- [ ] **Step 5: 브랜치 검증**

Run: `cd frontend && npm run lint`
Expected: PASS

Run: `cd frontend && npm run build`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add frontend/src/components/games/GameDetailView.jsx frontend/src/features/games/api/games-api.js frontend/src/components/games/__tests__/GameDetailView.test.jsx
git commit -m "feat: 경기 삭제 API 연동"
```

## Execution Order

1. `feat/기록-api-연동`
2. `feat/개별-경기-상세-api-연동`
3. `feat/경기-쓰기-api-연동`

## Verification Checklist

- [ ] 로그인 후 `records` 진입 가능
- [ ] `records` 필터 변경 시 stats 재조회
- [ ] 개별 경기 상세 조회 가능
- [ ] 경기 생성 성공
- [ ] 경기 수정 성공
- [ ] 경기 삭제 성공
- [ ] 인증 만료 시 refresh 후 재시도
- [ ] `cd frontend && npm run lint`
- [ ] `cd frontend && npm run test`
- [ ] `cd frontend && npm run build`
