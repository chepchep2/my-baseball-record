# Frontend Login Session Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/auth/google`, `POST /api/auth/refresh`, `POST /api/auth/logout` 계약 기반으로 프론트 로그인 세션(로그인, 토큰 저장, 인증 헤더, 401 재발급 재시도, 로그아웃)을 연결한다.

**Architecture:** Next.js App Router 구조에서 페이지는 화면 조합/라우팅에 집중하고, 인증 세션 로직은 `features/auth`에 모은다. 토큰 저장은 `accessToken(메모리)` + `refreshToken(localStorage)`로 분리해 모바일 웹 재진입 복구와 노출 리스크를 균형 있게 처리한다. API 호출은 공통 클라이언트로 통합하고, 401 발생 시 refresh 1회 후 원요청 1회 재시도 규칙을 사용한다.

**Tech Stack:** Next.js 15, React 19, fetch API, Vitest, Testing Library

---

## Scope Summary

- Google 로그인 호출
- access/refresh 저장 전략
- API 클라이언트 Authorization Bearer 적용
- 401 시 refresh 재발급 + 재시도
- 로그아웃 호출 + 토큰 삭제

## Contract Baseline

- `POST /api/auth/google`
  - request: `{ "idToken": "google-id-token" }`
  - response: `accessToken`, `refreshToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`
- `POST /api/auth/refresh`
  - request: `{ "refreshToken": "refresh-token" }`
  - response: `accessToken`, `refreshToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`
- `POST /api/auth/logout`
  - request: `{ "refreshToken": "refresh-token" }`
  - response: `204 No Content`

## AGENTS.md Alignment

- 페이지 파일은 라우팅/화면 조합 중심으로 유지한다.
- 인증/세션 로직은 `features/auth`와 공통 클라이언트로 분리한다.
- 모바일 탭 흐름을 깨지 않는다.
- 로그아웃 진입점은 `내 정보` 탭으로 고정한다.
- 문서 계약 외 응답 shape를 임의 확장하지 않는다.

## File Structure

- Create: `frontend/src/features/auth/api/auth-api.js`
- Create: `frontend/src/features/auth/session/token-storage.js`
- Create: `frontend/src/features/auth/session/AuthSessionContext.jsx`
- Create: `frontend/src/features/auth/session/useAuthSession.js`
- Create: `frontend/src/features/auth/google/google-identity.js`
- Create: `frontend/src/lib/http/api-client.js`
- Create: `frontend/src/lib/http/__tests__/api-client.test.js`
- Create: `frontend/src/features/auth/session/__tests__/auth-session-context.test.jsx`
- Modify: `frontend/src/components/providers/AppProviders.jsx`
- Modify: `frontend/src/app/auth/page.jsx`
- Modify: `frontend/src/app/account/page.jsx`
- Modify: `frontend/src/app/home/page.jsx`
- Modify: `frontend/src/app/records/page.jsx`
- Modify: `frontend/src/app/games/page.jsx`
- Modify: `frontend/src/app/games/new/page.jsx`
- Modify: `frontend/src/app/games/[gameId]/page.jsx`
- Modify: `frontend/src/components/layout/AppPageLayout.jsx`
- Modify: `frontend/src/components/navigation/BottomTabBar.jsx`
- Modify: `frontend/src/app/globals.css`

---

## Chunk 1: Auth Session Foundation

### Task 1: 인증 API 어댑터 추가

- [ ] `frontend/src/features/auth/api/auth-api.js` 생성
- [ ] `loginWithGoogle(idToken)` 구현 (`POST /api/auth/google`)
- [ ] `refreshSession(refreshToken)` 구현 (`POST /api/auth/refresh`)
- [ ] `logoutSession(refreshToken)` 구현 (`POST /api/auth/logout`)
- [ ] 에러 응답은 `code`, `message`, `retryable`, `fieldErrors`를 그대로 전달하도록 표준화
- [ ] 커밋

Commit:
```bash
git add frontend/src/features/auth/api/auth-api.js
git commit -m "feat(frontend): add auth api adapters for google refresh logout"
```

### Task 2: 토큰 저장 전략 모듈 추가

- [ ] `frontend/src/features/auth/session/token-storage.js` 생성
- [ ] 저장 규칙 구현
  - `accessToken`: 메모리 변수
  - `refreshToken`: `localStorage`(`auth.refreshToken` 키)
  - `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`: `localStorage`(`auth.sessionMeta` 키)
- [ ] 조회/삭제 함수 구현
  - `saveSessionTokens`
  - `readSessionMeta`
  - `readStoredRefreshToken`
  - `getAccessToken`
  - `setAccessToken`
  - `clearSessionTokens`
- [ ] 브라우저 환경 가드(`typeof window !== "undefined"`) 적용
- [ ] 커밋

Commit:
```bash
git add frontend/src/features/auth/session/token-storage.js
git commit -m "feat(frontend): implement auth token storage strategy"
```

### Task 3: AuthSession Provider/Hook 연결

- [ ] `frontend/src/features/auth/session/AuthSessionContext.jsx` 생성
- [ ] `frontend/src/features/auth/session/useAuthSession.js` 생성
- [ ] Provider 상태 구성
  - `user`, `isAuthenticated`, `isBootstrapping`, `authError`
- [ ] Provider 액션 구성
  - `loginWithGoogleIdToken`
  - `refreshIfNeeded`
  - `logout`
  - `clearAuthError`
- [ ] 앱 시작 시 `localStorage` refresh/sessionMeta를 읽고 세션 복구 시도
- [ ] `frontend/src/components/providers/AppProviders.jsx`에서 `AuthSessionProvider`로 감싸기
- [ ] 커밋

Commit:
```bash
git add frontend/src/features/auth/session/AuthSessionContext.jsx frontend/src/features/auth/session/useAuthSession.js frontend/src/components/providers/AppProviders.jsx
git commit -m "feat(frontend): add auth session provider and bootstrap flow"
```

---

## Chunk 2: Login / Bearer / Refresh Retry

### Task 4: Google 로그인 화면 실연동

- [ ] `frontend/src/features/auth/google/google-identity.js` 생성
- [ ] `requestGoogleIdToken()` 인터페이스 구현
  - 초기 단계는 실제 SDK 대신 주입 가능한 adapter 형태로 구성
  - 실패/취소/성공 상태를 구분해 반환
- [ ] `frontend/src/app/auth/page.jsx` 수정
  - 버튼 클릭 시 `requestGoogleIdToken()` 호출
  - 성공 시 `loginWithGoogleIdToken(idToken)` 호출
  - 성공 후 `/home` 이동
  - 실패/취소/세션 만료 메시지 상단 노출
- [ ] 커밋

Commit:
```bash
git add frontend/src/features/auth/google/google-identity.js frontend/src/app/auth/page.jsx
git commit -m "feat(frontend): wire auth page to google login and backend session issue"
```

### Task 5: 공통 API 클라이언트 + Bearer 적용

- [ ] `frontend/src/lib/http/api-client.js` 생성
- [ ] 요청 공통 처리 구현
  - `Content-Type: application/json`
  - `getAccessToken()` 결과가 있으면 `Authorization: Bearer <token>` 추가
- [ ] 메서드 래퍼 구현 (`get`, `post`, `put`, `delete`)
- [ ] 기존 fetch 호출 지점을 새 client 사용으로 점진 전환 가능한 형태로 노출
- [ ] 커밋

Commit:
```bash
git add frontend/src/lib/http/api-client.js
git commit -m "feat(frontend): add shared api client with bearer authorization"
```

### Task 6: 401 refresh 재발급 + 재시도 규칙

- [ ] `frontend/src/lib/http/api-client.js` 수정
- [ ] 401 처리 규칙 구현
  - 401 발생 시 `refreshSession(refreshToken)` 1회 시도
  - refresh 성공 시 access/refresh 갱신 후 원요청 1회 재시도
  - 재시도 후에도 401이면 실패 반환
- [ ] 동시 401 보호 규칙
  - provider 내부 `refreshPromise` 잠금으로 중복 refresh 방지
- [ ] refresh 실패 코드(`INVALID/EXPIRED/REVOKED`)는 세션 정리 + `/auth` 유도
- [ ] 커밋

Commit:
```bash
git add frontend/src/lib/http/api-client.js frontend/src/features/auth/session/AuthSessionContext.jsx frontend/src/features/auth/api/auth-api.js
git commit -m "feat(frontend): implement refresh-on-401 with single retry"
```

---

## Chunk 3: Logout + Route Guard + UX Integration

### Task 7: 로그아웃 연동

- [ ] `frontend/src/app/account/page.jsx` 수정
- [ ] 로그아웃 버튼 클릭 시
  - 현재 refresh token으로 `POST /api/auth/logout`
  - 성공/실패와 무관하게 로컬 토큰 삭제
  - `/auth`로 이동
- [ ] 로그아웃 버튼은 `내 정보` 탭에서만 유지
- [ ] 커밋

Commit:
```bash
git add frontend/src/app/account/page.jsx frontend/src/features/auth/session/AuthSessionContext.jsx
git commit -m "feat(frontend): connect account logout with server token revocation"
```

### Task 8: 보호 라우트와 탭 흐름 반영

- [ ] 보호 페이지(`home`, `records`, `games`, `games/new`, `games/[gameId]`)에 인증 가드 추가
- [ ] 세션 없으면 `/auth` 리다이렉트
- [ ] 초기 복구 중(`isBootstrapping`)에는 로딩 상태 처리
- [ ] `AppPageLayout`, `BottomTabBar`, `globals.css`에서 모바일 흐름과 메시지 배너 스타일 정리
- [ ] 커밋

Commit:
```bash
git add frontend/src/app/home/page.jsx frontend/src/app/records/page.jsx frontend/src/app/games/page.jsx frontend/src/app/games/new/page.jsx frontend/src/app/games/[gameId]/page.jsx frontend/src/components/layout/AppPageLayout.jsx frontend/src/components/navigation/BottomTabBar.jsx frontend/src/app/globals.css
git commit -m "feat(frontend): add auth guards and keep mobile tab flow"
```

---

## Chunk 4: Verification

### Task 9: 자동 검증

- [ ] API 클라이언트 테스트 추가: `frontend/src/lib/http/__tests__/api-client.test.js`
  - Bearer 헤더 포함
  - 401 -> refresh -> 재시도
  - refresh 실패 시 세션 정리 경로
- [ ] 세션 컨텍스트 테스트 추가: `frontend/src/features/auth/session/__tests__/auth-session-context.test.jsx`
  - 로그인 성공 시 저장
  - 로그아웃 시 삭제
  - 부트스트랩 복구
- [ ] 단위 테스트 실행

Run: `cd frontend && npm run test`
Expected: PASS

- [ ] 린트 실행

Run: `cd frontend && npm run lint`
Expected: PASS

- [ ] 프로덕션 빌드 실행

Run: `cd frontend && npm run build`
Expected: PASS

### Task 10: 수동 시나리오 검증 (모바일 우선)

- [ ] `cd frontend && npm run dev`
- [ ] 시나리오 1: Google 로그인 성공 -> 홈 이동
- [ ] 시나리오 2: 인증 API 호출 시 Bearer 헤더 포함
- [ ] 시나리오 3: access 만료(401) -> refresh -> 자동 재시도 성공
- [ ] 시나리오 4: refresh 만료/폐기 -> 세션 정리 + `/auth` 이동
- [ ] 시나리오 5: 내 정보 로그아웃 -> `/api/auth/logout` 호출 + 토큰 삭제

---

## Commit Order

1. `feat(frontend): add auth api adapters for google refresh logout`
2. `feat(frontend): implement auth token storage strategy`
3. `feat(frontend): add auth session provider and bootstrap flow`
4. `feat(frontend): wire auth page to google login and backend session issue`
5. `feat(frontend): add shared api client with bearer authorization`
6. `feat(frontend): implement refresh-on-401 with single retry`
7. `feat(frontend): connect account logout with server token revocation`
8. `feat(frontend): add auth guards and keep mobile tab flow`
