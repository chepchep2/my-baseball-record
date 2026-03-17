# Baseball Record V1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 프론트엔드를 새로 구성해 인증, 이번 시즌/통산 기록 조회, 경기 생성 및 타자/투수 기록 입력 흐름을 백엔드 API와 연결된 React SPA로 구현한다.

**Architecture:** 별도 프론트엔드 저장소에서 React + JavaScript 기반 SPA를 구성하고, `auth`, `records`, `games` 기능 단위로 화면과 API 계층을 분리한다. 기본 진입은 인증 화면으로 두고, 로그인 후 기록 화면으로 이동하며, 기록 화면에서는 시간 축(`이번 시즌`/`통산`/특정 연도), 기록 축(`타자`/`투수`), 경기 필터(`전체`/`리그`/`비공식 경기`)를 조합해 통합 기록을 조회한다. 경기 입력은 `경기 정보`와 `기록 입력`으로 나누되, 기록 입력 단계 안에서는 `타자 탭`/`투수 탭` 전환형 UI를 사용해 한쪽만 입력하거나 둘 다 입력할 수 있게 한다.

**Tech Stack:** React, JavaScript, Vite, React Router, TanStack Query, React Hook Form, Zod, Vitest, React Testing Library, Mock Service Worker

---

## Assumptions

- 이 계획 문서는 현재 문서 저장소에 보관되지만, 실제 구현은 별도 프론트엔드 저장소에서 수행한다.
- 아래 경로는 모두 future frontend repo root 기준 상대경로다.
- 디자인 시스템은 아직 없으므로 접근성과 가독성을 우선하는 얇은 공통 컴포넌트만 만든다.
- 최근 경기 전용 화면은 v1 프론트 범위에서 제외한다.
- 백엔드 계약은 `docs/superpowers/plans/2026-03-16-baseball-record-v1-backend.md`의 엔드포인트를 기준으로 한다.
- 인증 성공 후 access token / refresh token을 받아 세션을 유지하며, 로그아웃 시 refresh token 무효화 API를 호출한다.
- 타입 안정성은 TypeScript 대신 명확한 파일 분리, Zod 검증, 테스트로 확보한다.

## References

- Spec: `docs/superpowers/specs/2026-03-17-scenario-v1.md`
- Spec: `docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- Plan: `docs/superpowers/plans/2026-03-16-baseball-record-v1-backend.md`

## File Structure

### Project Setup

- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles/reset.css`
- Create: `src/styles/theme.css`
- Create: `src/styles/global.css`

### App Providers And Routing

- Create: `src/app/providers/AppProviders.jsx`
- Create: `src/app/router/AppRouter.jsx`
- Create: `src/app/router/ProtectedRoute.jsx`
- Create: `src/app/router/PublicOnlyRoute.jsx`

### Config And API

- Create: `src/config/env.js`
- Create: `src/lib/http/apiClient.js`
- Create: `src/lib/http/tokenStorage.js`
- Create: `src/lib/http/authApi.js`
- Create: `src/lib/http/statsApi.js`
- Create: `src/lib/http/gamesApi.js`
- Create: `src/lib/query/queryClient.js`

### Shared UI

- Create: `src/components/layout/AppHeader.jsx`
- Create: `src/components/layout/PageContainer.jsx`
- Create: `src/components/common/Button.jsx`
- Create: `src/components/common/TextField.jsx`
- Create: `src/components/common/SelectField.jsx`
- Create: `src/components/common/Banner.jsx`
- Create: `src/components/common/SegmentedControl.jsx`
- Create: `src/components/common/StatCard.jsx`
- Create: `src/components/common/EmptyState.jsx`
- Create: `src/components/common/LoadingState.jsx`

### Auth Feature

- Create: `src/features/auth/api/useLoginMutation.js`
- Create: `src/features/auth/api/useSignupMutation.js`
- Create: `src/features/auth/api/useLogoutMutation.js`
- Create: `src/features/auth/components/AuthLayout.jsx`
- Create: `src/features/auth/components/LoginForm.jsx`
- Create: `src/features/auth/components/SignupForm.jsx`
- Create: `src/features/auth/pages/AuthPage.jsx`
- Create: `src/features/auth/schema/authSchemas.js`
- Create: `src/features/auth/store/AuthSessionProvider.jsx`
- Create: `src/features/auth/store/useAuthSession.js`

### Records Feature

- Create: `src/features/records/api/useIntegratedStatsQuery.js`
- Create: `src/features/records/components/RecordFilterBar.jsx`
- Create: `src/features/records/components/RecordSummarySection.jsx`
- Create: `src/features/records/components/RecordMetricGrid.jsx`
- Create: `src/features/records/components/RecordModeNotice.jsx`
- Create: `src/features/records/pages/RecordsPage.jsx`
- Create: `src/features/records/utils/recordLabels.js`

### Game Entry Feature

- Create: `src/features/games/api/useCreateGameMutation.js`
- Create: `src/features/games/api/useUpdateBatterRecordMutation.js`
- Create: `src/features/games/api/useUpdatePitcherRecordMutation.js`
- Create: `src/features/games/components/GameInfoForm.jsx`
- Create: `src/features/games/components/BatterRecordForm.jsx`
- Create: `src/features/games/components/PitcherRecordForm.jsx`
- Create: `src/features/games/components/RecordEntryTabs.jsx`
- Create: `src/features/games/pages/GameEntryPage.jsx`
- Create: `src/features/games/schema/gameSchemas.js`
- Create: `src/features/games/utils/gameMappers.js`

### Test Support

- Create: `src/test/renderWithProviders.jsx`
- Create: `src/test/server.js`
- Create: `src/test/handlers.js`
- Create: `src/test/setup.js`
- Create: `src/App.test.jsx`
- Create: `src/features/auth/pages/AuthPage.test.jsx`
- Create: `src/features/records/pages/RecordsPage.test.jsx`
- Create: `src/features/games/pages/GameEntryPage.test.jsx`
- Create: `src/features/auth/schema/authSchemas.test.js`
- Create: `src/features/games/schema/gameSchemas.test.js`
- Create: `src/lib/http/apiClient.test.js`

---

## Chunk 1: Project Scaffold And App Runtime

### Task 1: Vite 앱과 테스트 런타임을 부트스트랩한다

**Files:**
- Create: `package.json`
- Create: `vite.config.js`
- Create: `index.html`
- Create: `src/main.jsx`
- Create: `src/App.jsx`
- Create: `src/styles/reset.css`
- Create: `src/styles/theme.css`
- Create: `src/styles/global.css`
- Create: `src/test/setup.js`
- Create: `src/App.test.jsx`

- [ ] **Step 1: 앱 부트스트랩 테스트를 먼저 작성한다**

Create `src/App.test.jsx` with:

```jsx
import { render, screen } from "@testing-library/react";
import App from "./App";

test("앱이 라우터와 함께 렌더된다", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: 앱 엔트리나 테스트 설정이 없어 FAIL

- [ ] **Step 3: Vite + React + JavaScript 프로젝트 파일을 만든다**

`package.json`에 아래 의존성을 포함한다.

```json
{
  "name": "my-baseball-record-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@hookform/resolvers": "^4.1.0",
    "@tanstack/react-query": "^5.66.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.54.0",
    "react-router-dom": "^7.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.0",
    "@vitejs/plugin-react": "^5.0.0",
    "jsdom": "^26.0.0",
    "msw": "^2.7.0",
    "vite": "^7.0.0",
    "vitest": "^3.0.0"
  }
}
```

`vite.config.js`에는 React plugin과 `test.environment = "jsdom"` 설정을 포함한다.

- [ ] **Step 4: 전역 스타일과 앱 엔트리를 최소 구현한다**

구현 내용:
- `src/main.jsx`: `createRoot`로 앱 마운트
- `src/App.jsx`: 임시로 `로그인` 제목만 렌더하는 최소 앱 셸을 둔다
- `src/styles/*.css`: reset, 토큰, 타이포, 버튼 기본 스타일
- `src/test/setup.js`: `@testing-library/jest-dom` 로드

- [ ] **Step 5: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 6: 커밋한다**

```bash
git add package.json vite.config.js index.html src/main.jsx src/App.jsx src/styles/reset.css src/styles/theme.css src/styles/global.css src/test/setup.js src/App.test.jsx
git commit -m "feat: bootstrap frontend app shell"
```

### Task 2: 앱 provider와 라우팅 골격을 추가한다

**Files:**
- Create: `src/app/providers/AppProviders.jsx`
- Create: `src/app/router/AppRouter.jsx`
- Create: `src/app/router/ProtectedRoute.jsx`
- Create: `src/app/router/PublicOnlyRoute.jsx`
- Create: `src/lib/query/queryClient.js`
- Create: `src/config/env.js`
- Modify: `src/App.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: 인증 전에는 `/records` 접근이 차단되는 테스트를 작성한다**

Add to `src/App.test.jsx`:

```jsx
import { MemoryRouter } from "react-router-dom";

test("인증 전 사용자가 기록 화면에 접근하면 로그인 화면으로 이동한다", () => {
  render(
    <MemoryRouter initialEntries={["/records"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: "로그인" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: provider 또는 라우터 구성이 없어 FAIL

- [ ] **Step 3: 앱 provider와 라우팅 골격을 구현한다**

구현 내용:
- `AppProviders`: `QueryClientProvider`와 추후 인증 provider를 감싼다
- `AppRouter`: `/auth`, `/records`, `/games/new` 라우트 선언
- 이 단계에서는 각 라우트에 임시 placeholder 화면도 함께 둔다
  - `/auth` -> `로그인`
  - `/records` -> `이번 시즌 기록`
  - `/games/new` -> `경기 기록 입력`
- `ProtectedRoute`: 인증 없으면 `/auth`로 보낸다
- `PublicOnlyRoute`: 이미 로그인한 사용자는 `/records`로 보낸다
- `/` 기본 진입은 `/auth`로 둔다
- `env.js`: `VITE_API_BASE_URL` 읽기

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/app/providers/AppProviders.jsx src/app/router/AppRouter.jsx src/app/router/ProtectedRoute.jsx src/app/router/PublicOnlyRoute.jsx src/lib/query/queryClient.js src/config/env.js src/App.jsx src/App.test.jsx
git commit -m "feat: add app providers and route guards"
```

---

## Chunk 2: Auth Session And Authentication Screen

### Task 3: 토큰 저장소와 API 클라이언트를 구성한다

**Files:**
- Create: `src/lib/http/tokenStorage.js`
- Create: `src/lib/http/apiClient.js`
- Create: `src/lib/http/authApi.js`
- Create: `src/lib/http/apiClient.test.js`

- [ ] **Step 1: 인증 헤더가 자동으로 붙는 테스트를 먼저 작성한다**

Create `src/lib/http/apiClient.test.js` with:

```js
import { createApiClient } from "./apiClient";

test("저장된 access token이 있으면 Authorization 헤더를 추가한다", async () => {
  const fetchSpy = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );

  const client = createApiClient({
    baseUrl: "http://localhost:8080",
    getAccessToken: () => "access-token",
    fetchImpl: fetchSpy
  });

  await client("/api/stats/integrated");

  expect(fetchSpy).toHaveBeenCalledWith(
    "http://localhost:8080/api/stats/integrated",
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: "Bearer access-token"
      })
    })
  );
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/lib/http/apiClient.test.js`
Expected: API 클라이언트가 없어 FAIL

- [ ] **Step 3: 토큰 저장소와 API 클라이언트를 최소 구현한다**

구현 내용:
- `tokenStorage.js`: access token / refresh token get, set, clear
- `apiClient.js`: base URL, JSON 요청/응답 처리, bearer token 주입
- `authApi.js`: `signup`, `login`, `logout`, `refresh` 함수
- 공통 API 에러 구조 정의

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/lib/http/apiClient.test.js`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/lib/http/tokenStorage.js src/lib/http/apiClient.js src/lib/http/authApi.js src/lib/http/apiClient.test.js
git commit -m "feat: add auth-aware API client"
```

### Task 4: 인증 세션 provider를 구현한다

**Files:**
- Create: `src/features/auth/store/AuthSessionProvider.jsx`
- Create: `src/features/auth/store/useAuthSession.js`
- Create: `src/features/auth/api/useLoginMutation.js`
- Create: `src/features/auth/api/useSignupMutation.js`
- Create: `src/features/auth/api/useLogoutMutation.js`
- Modify: `src/app/providers/AppProviders.jsx`
- Modify: `src/app/router/ProtectedRoute.jsx`
- Modify: `src/app/router/PublicOnlyRoute.jsx`
- Modify: `src/App.test.jsx`

- [ ] **Step 1: 로그인 성공 후 보호 라우트 접근이 열리는 테스트를 추가한다**

Add to `src/App.test.jsx`:

```jsx
test("로그인 세션이 있으면 기록 화면 접근을 허용한다", () => {
  window.localStorage.setItem("mbr.accessToken", "access-token");
  window.localStorage.setItem("mbr.refreshToken", "refresh-token");

  render(
    <MemoryRouter initialEntries={["/records"]}>
      <App />
    </MemoryRouter>
  );

  expect(screen.queryByRole("heading", { name: "로그인" })).not.toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: 인증 provider가 없어 FAIL

- [ ] **Step 3: 인증 세션 상태를 구현한다**

구현 내용:
- 앱 시작 시 local storage에서 토큰 복구
- `login`, `signup`, `logout` 액션 제공
- 로그아웃 시 `POST /api/auth/logout` 호출 후 토큰 제거
- 세션 유무를 route guard가 참조하도록 연결

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/App.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/features/auth/store/AuthSessionProvider.jsx src/features/auth/store/useAuthSession.js src/features/auth/api/useLoginMutation.js src/features/auth/api/useSignupMutation.js src/features/auth/api/useLogoutMutation.js src/app/providers/AppProviders.jsx src/app/router/ProtectedRoute.jsx src/app/router/PublicOnlyRoute.jsx src/App.test.jsx
git commit -m "feat: add auth session state"
```

### Task 5: 로그인/회원가입 화면을 구현한다

**Files:**
- Create: `src/components/common/Button.jsx`
- Create: `src/components/common/TextField.jsx`
- Create: `src/components/common/Banner.jsx`
- Create: `src/features/auth/components/AuthLayout.jsx`
- Create: `src/features/auth/components/LoginForm.jsx`
- Create: `src/features/auth/components/SignupForm.jsx`
- Create: `src/features/auth/pages/AuthPage.jsx`
- Create: `src/features/auth/schema/authSchemas.js`
- Create: `src/features/auth/schema/authSchemas.test.js`
- Create: `src/test/renderWithProviders.jsx`
- Create: `src/test/handlers.js`
- Create: `src/test/server.js`
- Create: `src/features/auth/pages/AuthPage.test.jsx`

- [ ] **Step 1: 회원가입 검증 테스트를 먼저 작성한다**

Create `src/features/auth/schema/authSchemas.test.js` with:

```js
import { signupSchema } from "./authSchemas";

test("회원가입 비밀번호 규칙을 검증한다", () => {
  const result = signupSchema.safeParse({
    name: "홍길동",
    email: "user@example.com",
    password: "password",
    passwordConfirm: "password"
  });

  expect(result.success).toBe(false);
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/auth/schema/authSchemas.test.js`
Expected: schema 파일이 없어 FAIL

- [ ] **Step 3: 인증 schema를 구현한다**

구현 내용:
- 로그인: 이메일 형식, 비밀번호 필수
- 회원가입: 이름 필수, 이메일 형식, `최소 8자 + 영문 + 숫자 + 특수문자`, 비밀번호 확인 일치

- [ ] **Step 4: 인증 화면 UI 테스트를 작성한다**

Create `src/features/auth/pages/AuthPage.test.jsx` with:

```jsx
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "../../../test/server";
import { AuthPage } from "./AuthPage";

test("회원가입 성공 시 기록 화면으로 이동한다", async () => {
  server.use(
    http.post("http://localhost:8080/api/auth/signup", async () =>
      HttpResponse.json({
        accessToken: "access-token",
        refreshToken: "refresh-token"
      })
    )
  );

  const user = userEvent.setup();

  renderWithProviders(<AuthPage />, { initialEntries: ["/auth"] });

  await user.click(screen.getByRole("tab", { name: "회원가입" }));
  await user.type(screen.getByLabelText("이름"), "홍길동");
  await user.type(screen.getByLabelText("이메일"), "user@example.com");
  await user.type(screen.getByLabelText("비밀번호"), "Passw0rd!");
  await user.type(screen.getByLabelText("비밀번호 확인"), "Passw0rd!");
  await user.click(screen.getByRole("button", { name: "회원가입" }));

  expect(await screen.findByRole("heading", { name: "이번 시즌 기록" })).toBeInTheDocument();
});
```

주의:
- 이 테스트는 `Task 2`에서 만든 `/records` placeholder를 먼저 활용한다.
- `Chunk 3`에서 실제 `RecordsPage`로 교체되더라도 같은 헤딩을 유지해 테스트를 계속 살린다.

- [ ] **Step 5: UI 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/auth/pages/AuthPage.test.jsx`
Expected: 테스트 헬퍼 또는 페이지 컴포넌트가 없어 FAIL

- [ ] **Step 6: 공통 폼 UI와 인증 화면을 구현한다**

구현 내용:
- `AuthPage`: 로그인/회원가입 탭 전환, 로그인 기본 탭
- `LoginForm`: 이메일, 비밀번호
- `SignupForm`: 이름, 이메일, 비밀번호, 비밀번호 확인
- 필드 에러는 입력 필드 아래에 노출
- API 실패 메시지는 상단 `Banner`에 노출

- [ ] **Step 7: 테스트 헬퍼와 MSW 기본 설정을 구현한다**

구현 내용:
- `renderWithProviders.jsx`: 라우터, QueryClient, AuthSessionProvider 래핑
- `handlers.js`, `server.js`: 인증 성공/실패, 기본 stats 응답 mock

- [ ] **Step 8: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/auth/schema/authSchemas.test.js src/features/auth/pages/AuthPage.test.jsx`
Expected: PASS

- [ ] **Step 9: 커밋한다**

```bash
git add src/components/common/Button.jsx src/components/common/TextField.jsx src/components/common/Banner.jsx src/features/auth/components/AuthLayout.jsx src/features/auth/components/LoginForm.jsx src/features/auth/components/SignupForm.jsx src/features/auth/pages/AuthPage.jsx src/features/auth/schema/authSchemas.js src/features/auth/schema/authSchemas.test.js src/test/renderWithProviders.jsx src/test/handlers.js src/test/server.js src/features/auth/pages/AuthPage.test.jsx
git commit -m "feat: implement authentication screens"
```

---

## Chunk 3: Records Overview Screen

### Task 6: 기록 조회 API 계층을 구현한다

**Files:**
- Create: `src/lib/http/statsApi.js`
- Create: `src/features/records/api/useIntegratedStatsQuery.js`
- Modify: `src/lib/http/apiClient.test.js`

- [ ] **Step 1: 통합 기록 조회 요청 매핑 테스트를 추가한다**

Add to `src/lib/http/apiClient.test.js`:

```js
import { getIntegratedStats } from "./statsApi";

test("기록 조회 API가 mode와 filter를 쿼리스트링으로 보낸다", async () => {
  const fetchSpy = vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ summary: {}, metrics: [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  );

  const client = createApiClient({
    baseUrl: "http://localhost:8080",
    getAccessToken: () => "access-token",
    fetchImpl: fetchSpy
  });

  await getIntegratedStats(client, {
    mode: "season",
    seasonYear: 2026,
    recordType: "batter",
    gameFilter: "all"
  });

  expect(fetchSpy.mock.calls[0][0]).toContain(
    "/api/stats/integrated?mode=season&seasonYear=2026&recordType=batter&gameFilter=all"
  );
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/lib/http/apiClient.test.js`
Expected: stats API가 없어 FAIL

- [ ] **Step 3: 기록 조회 API 함수를 구현한다**

구현 내용:
- 시간 축: `season`, `career`
- 기록 축: `batter`, `pitcher`
- 경기 필터: `all`, `league`, `non_official`
- 백엔드 응답을 UI에서 바로 쓰기 쉬운 형태로 정리
- `useIntegratedStatsQuery`에서 query key를 축 조합별로 구성

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/lib/http/apiClient.test.js`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/lib/http/statsApi.js src/features/records/api/useIntegratedStatsQuery.js src/lib/http/apiClient.test.js
git commit -m "feat: add integrated stats query layer"
```

### Task 7: 기록 화면 필터와 레이아웃을 구현한다

**Files:**
- Create: `src/components/layout/AppHeader.jsx`
- Create: `src/components/layout/PageContainer.jsx`
- Create: `src/components/common/SelectField.jsx`
- Create: `src/components/common/SegmentedControl.jsx`
- Create: `src/components/common/LoadingState.jsx`
- Create: `src/components/common/EmptyState.jsx`
- Create: `src/features/records/components/RecordFilterBar.jsx`
- Create: `src/features/records/components/RecordModeNotice.jsx`
- Create: `src/features/records/pages/RecordsPage.jsx`
- Create: `src/features/records/pages/RecordsPage.test.jsx`

- [ ] **Step 1: 기록 화면 기본 구조 테스트를 작성한다**

Create `src/features/records/pages/RecordsPage.test.jsx` with:

```jsx
import { renderWithProviders } from "../../../test/renderWithProviders";
import { screen } from "@testing-library/react";
import { RecordsPage } from "./RecordsPage";

test("기록 화면은 이번 시즌 기록과 필터 컨트롤을 기본으로 보여준다", async () => {
  renderWithProviders(<RecordsPage />, { initialEntries: ["/records"] });

  expect(await screen.findByRole("heading", { name: "이번 시즌 기록" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "타자" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "투수" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "전체" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "리그" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "비공식 경기" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "경기 추가" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: 기록 화면과 공통 UI가 없어 FAIL

- [ ] **Step 3: 공통 레이아웃과 필터 바를 구현한다**

구현 내용:
- `AppHeader`: 제목, 우측 액션 슬롯, 로그아웃 버튼 슬롯
- `PageContainer`: 최대 폭과 반응형 padding
- `RecordFilterBar`: 시간 축, 기록 축, 경기 필터, 연도 선택
- `RecordModeNotice`: `통산` 선택 시 설명 문구, 시즌 선택 시 현재 연도 문구

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/components/layout/AppHeader.jsx src/components/layout/PageContainer.jsx src/components/common/SelectField.jsx src/components/common/SegmentedControl.jsx src/components/common/LoadingState.jsx src/components/common/EmptyState.jsx src/features/records/components/RecordFilterBar.jsx src/features/records/components/RecordModeNotice.jsx src/features/records/pages/RecordsPage.jsx src/features/records/pages/RecordsPage.test.jsx
git commit -m "feat: add records page filters and layout"
```

### Task 8: 기록 요약 카드와 로그아웃 동작을 구현한다

**Files:**
- Create: `src/components/common/StatCard.jsx`
- Create: `src/features/records/components/RecordSummarySection.jsx`
- Create: `src/features/records/components/RecordMetricGrid.jsx`
- Create: `src/features/records/utils/recordLabels.js`
- Modify: `src/features/records/pages/RecordsPage.jsx`
- Modify: `src/features/records/pages/RecordsPage.test.jsx`

- [ ] **Step 1: 0 값 카드와 로그아웃 테스트를 추가한다**

Add to `src/features/records/pages/RecordsPage.test.jsx`:

```jsx
import userEvent from "@testing-library/user-event";

test("기록이 없어도 0을 포함한 기본 카드 구조를 보여준다", async () => {
  renderWithProviders(<RecordsPage />, { initialEntries: ["/records"] });

  expect(await screen.findByText("0.000")).toBeInTheDocument();
});

test("로그아웃 버튼을 누르면 인증 화면으로 돌아간다", async () => {
  const user = userEvent.setup();

  renderWithProviders(<RecordsPage />, { initialEntries: ["/records"] });

  await user.click(await screen.findByRole("button", { name: "로그아웃" }));

  expect(await screen.findByRole("heading", { name: "로그인" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: 요약 카드 또는 로그아웃 동작이 없어 FAIL

- [ ] **Step 3: 기록 요약 섹션과 로그아웃 액션을 구현한다**

구현 내용:
- 타자/투수별 핵심 지표 카드 렌더
- 기록이 없을 때도 0 기반 기본 구조 유지
- `경기 추가` 버튼은 `/games/new`로 이동
- 헤더 우측 `로그아웃` 버튼은 세션 provider 액션 호출

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/components/common/StatCard.jsx src/features/records/components/RecordSummarySection.jsx src/features/records/components/RecordMetricGrid.jsx src/features/records/utils/recordLabels.js src/features/records/pages/RecordsPage.jsx src/features/records/pages/RecordsPage.test.jsx
git commit -m "feat: render integrated stats and logout action"
```

---

## Chunk 4: Game Creation And Record Entry

### Task 9: 경기 정보 입력 폼과 검증을 구현한다

**Files:**
- Create: `src/lib/http/gamesApi.js`
- Create: `src/features/games/schema/gameSchemas.js`
- Create: `src/features/games/schema/gameSchemas.test.js`
- Create: `src/features/games/api/useCreateGameMutation.js`
- Create: `src/features/games/utils/gameMappers.js`
- Create: `src/features/games/components/GameInfoForm.jsx`
- Create: `src/features/games/pages/GameEntryPage.jsx`
- Create: `src/features/games/pages/GameEntryPage.test.jsx`

- [ ] **Step 1: 경기 정보 schema 테스트를 먼저 작성한다**

Create `src/features/games/schema/gameSchemas.test.js` with:

```js
import { gameInfoSchema } from "./gameSchemas";

test("날짜가 없으면 경기 정보를 저장할 수 없다", () => {
  const result = gameInfoSchema.safeParse({
    playedAt: "",
    gameType: "LEAGUE"
  });

  expect(result.success).toBe(false);
});

test("날짜 기준으로 seasonYear 기본값을 계산한다", () => {
  const mapped = gameInfoSchema.parse({
    playedAt: "2026-03-17",
    gameType: "LEAGUE",
    seasonYear: ""
  });

  expect(mapped.seasonYear).toBe(2026);
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/games/schema/gameSchemas.test.js`
Expected: schema 파일이 없어 FAIL

- [ ] **Step 3: 경기 정보 schema와 API 매퍼를 구현한다**

구현 내용:
- 필수: 날짜, 경기 유형
- 선택: seasonYear, teamName, opponentName, note
- seasonYear는 빈 값이면 날짜에서 자동 계산
- 백엔드 요청 DTO로 매핑하는 helper 제공

- [ ] **Step 4: 경기 정보 화면 테스트를 작성한다**

Create `src/features/games/pages/GameEntryPage.test.jsx` with:

```jsx
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../test/renderWithProviders";
import { screen } from "@testing-library/react";
import { GameEntryPage } from "./GameEntryPage";

test("경기 정보를 저장하면 기록 입력 탭 영역으로 이동한다", async () => {
  const user = userEvent.setup();

  renderWithProviders(<GameEntryPage />, {
    initialEntries: ["/games/new"],
    initialSession: {
      accessToken: "access-token",
      refreshToken: "refresh-token"
    }
  });

  await user.type(screen.getByLabelText("날짜"), "2026-03-17");
  await user.selectOptions(screen.getByLabelText("경기 유형"), "LEAGUE");
  await user.click(screen.getByRole("button", { name: "다음" }));

  expect(await screen.findByRole("tab", { name: "타자 기록" })).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "투수 기록" })).toBeInTheDocument();
});
```

- [ ] **Step 5: 화면 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/games/pages/GameEntryPage.test.jsx`
Expected: 페이지나 폼 컴포넌트가 없어 FAIL

- [ ] **Step 6: 경기 정보 폼과 첫 단계 UI를 구현한다**

구현 내용:
- 날짜, 경기 유형, seasonYear, 소속 팀, 상대 팀, 메모 필드
- 저장 전 단계에서는 로컬 폼 상태만 유지
- `다음` 클릭 후 기록 입력 단계 진입

- [ ] **Step 7: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/games/schema/gameSchemas.test.js src/features/games/pages/GameEntryPage.test.jsx`
Expected: PASS

- [ ] **Step 8: 커밋한다**

```bash
git add src/lib/http/gamesApi.js src/features/games/schema/gameSchemas.js src/features/games/schema/gameSchemas.test.js src/features/games/api/useCreateGameMutation.js src/features/games/utils/gameMappers.js src/features/games/components/GameInfoForm.jsx src/features/games/pages/GameEntryPage.jsx src/features/games/pages/GameEntryPage.test.jsx
git commit -m "feat: add game info entry flow"
```

### Task 10: 타자/투수 탭 전환형 기록 입력 UI를 구현한다

**Files:**
- Create: `src/features/games/api/useUpdateBatterRecordMutation.js`
- Create: `src/features/games/api/useUpdatePitcherRecordMutation.js`
- Create: `src/features/games/components/BatterRecordForm.jsx`
- Create: `src/features/games/components/PitcherRecordForm.jsx`
- Create: `src/features/games/components/RecordEntryTabs.jsx`
- Modify: `src/features/games/schema/gameSchemas.js`
- Modify: `src/features/games/pages/GameEntryPage.jsx`
- Modify: `src/features/games/pages/GameEntryPage.test.jsx`

- [ ] **Step 1: 한쪽만 입력해도 저장 가능한 테스트를 추가한다**

Add to `src/features/games/pages/GameEntryPage.test.jsx`:

```jsx
test("타자 기록만 입력하고 저장할 수 있다", async () => {
  const user = userEvent.setup();

  renderWithProviders(<GameEntryPage />, {
    initialEntries: ["/games/new"],
    initialSession: {
      accessToken: "access-token",
      refreshToken: "refresh-token"
    }
  });

  await user.type(screen.getByLabelText("날짜"), "2026-03-17");
  await user.selectOptions(screen.getByLabelText("경기 유형"), "LEAGUE");
  await user.click(screen.getByRole("button", { name: "다음" }));
  await user.type(await screen.findByLabelText("타석"), "4");
  await user.type(screen.getByLabelText("타수"), "3");
  await user.click(screen.getByRole("button", { name: "저장" }));

  expect(await screen.findByRole("heading", { name: "이번 시즌 기록" })).toBeInTheDocument();
});
```

- [ ] **Step 2: 부분 입력 검증 테스트를 추가한다**

Add to `src/features/games/schema/gameSchemas.test.js`:

```js
import { batterRecordSchema } from "./gameSchemas";

test("타자 기록을 일부만 입력하면 필요한 세트를 요구한다", () => {
  const result = batterRecordSchema.safeParse({
    plateAppearances: 4,
    atBats: undefined
  });

  expect(result.success).toBe(false);
});
```

- [ ] **Step 3: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/games/schema/gameSchemas.test.js src/features/games/pages/GameEntryPage.test.jsx`
Expected: 탭형 기록 입력 UI와 검증이 없어 FAIL

- [ ] **Step 4: 기록 입력 schema와 탭 UI를 구현한다**

구현 내용:
- `RecordEntryTabs`: `타자 기록` / `투수 기록` 전환
- 타자/투수 각 폼은 기본 항목 우선, `추가 기록 입력` 버튼으로 추가 항목 확장
- 한 탭이 완전히 비어 있으면 미입력으로 간주
- 한 탭에 하나라도 값이 있으면 유효한 세트인지 검증
- 투수 이닝은 `정수 이닝 + 추가 아웃 수` 입력 필드로 유지

- [ ] **Step 5: 저장 플로우를 구현한다**

구현 순서:
- `POST /api/games`로 경기 생성
- 타자 값이 있으면 `PUT /api/games/{gameId}/batter-record`
- 투수 값이 있으면 `PUT /api/games/{gameId}/pitcher-record`
- 둘 다 성공하면 `/records`로 이동

- [ ] **Step 6: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/games/schema/gameSchemas.test.js src/features/games/pages/GameEntryPage.test.jsx`
Expected: PASS

- [ ] **Step 7: 커밋한다**

```bash
git add src/features/games/api/useUpdateBatterRecordMutation.js src/features/games/api/useUpdatePitcherRecordMutation.js src/features/games/components/BatterRecordForm.jsx src/features/games/components/PitcherRecordForm.jsx src/features/games/components/RecordEntryTabs.jsx src/features/games/schema/gameSchemas.js src/features/games/pages/GameEntryPage.jsx src/features/games/pages/GameEntryPage.test.jsx
git commit -m "feat: implement batter and pitcher entry tabs"
```

---

## Chunk 5: Integration, Edge Cases, And Final Verification

### Task 11: 저장 후 기록 화면 재조회와 성공 피드백을 연결한다

**Files:**
- Modify: `src/features/records/api/useIntegratedStatsQuery.js`
- Modify: `src/features/records/pages/RecordsPage.jsx`
- Modify: `src/features/games/pages/GameEntryPage.jsx`
- Modify: `src/test/handlers.js`
- Modify: `src/features/records/pages/RecordsPage.test.jsx`

- [ ] **Step 1: 저장 후 재조회되는 테스트를 추가한다**

Add to `src/features/records/pages/RecordsPage.test.jsx`:

```jsx
test("경기 저장 후 기록 화면에서 갱신된 지표를 다시 조회한다", async () => {
  renderWithProviders(<RecordsPage />, {
    initialEntries: ["/records"],
    initialSession: {
      accessToken: "access-token",
      refreshToken: "refresh-token"
    }
  });

  expect(await screen.findByText("OPS")).toBeInTheDocument();
});
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: invalidation 또는 성공 피드백이 없어 FAIL

- [ ] **Step 3: 저장 성공 후 query invalidation과 상태 메시지를 추가한다**

구현 내용:
- 경기 저장 성공 시 integrated stats query invalidate
- `/records` 이동 시 `location.state` 또는 query param으로 저장 완료 메시지 표시
- `이번 시즌 기록` 기본 화면에서 갱신된 값 확인 가능

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `npm run test -- src/features/records/pages/RecordsPage.test.jsx`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add src/features/records/api/useIntegratedStatsQuery.js src/features/records/pages/RecordsPage.jsx src/features/games/pages/GameEntryPage.jsx src/test/handlers.js src/features/records/pages/RecordsPage.test.jsx
git commit -m "feat: connect save flow back to records page"
```

### Task 12: 전체 테스트, 빌드, README를 정리한다

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 프론트엔드 저장소용 README 초안을 작성한다**

포함 내용:
- 프로젝트 목적
- 백엔드 의존 API 목록
- 실행 방법
- 인증/기록 조회/경기 입력 흐름
- 최근 경기 화면이 v1 범위 밖이라는 점

- [ ] **Step 2: 전체 테스트를 실행한다**

Run: `npm run test`
Expected: 전체 테스트 PASS

- [ ] **Step 3: 프로덕션 빌드를 실행한다**

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 4: 수동 흐름을 점검한다**

확인 순서:
- `/auth` 진입
- 로그인 또는 회원가입
- `/records` 이동
- `이번 시즌` / `통산` / 특정 연도 전환
- `타자` / `투수` 전환
- `전체` / `리그` / `비공식 경기` 필터 전환
- `경기 추가`
- 경기 정보 입력
- `타자 기록` 또는 `투수 기록`만 입력 후 저장
- `/records` 복귀와 로그아웃

- [ ] **Step 5: 최종 커밋한다**

```bash
git add README.md
git commit -m "docs: add frontend setup and workflow guide"
```

## Notes For Execution

- 기본 진입은 반드시 인증 화면이다. 인증 없는 `/records`, `/games/new` 접근은 허용하지 않는다.
- 기록 화면은 `이번 시즌`만이 아니라 `통산`과 특정 연도 조회를 모두 지원해야 한다.
- 로그아웃 버튼은 기록 화면 상단 우측에서 항상 접근 가능해야 한다.
- 기록 입력 화면은 위저드형 `타자 -> 투수` 고정 흐름이 아니라, 경기 정보 저장 후 `타자 탭` / `투수 탭` 전환형이어야 한다.
- 최근 경기 전용 화면은 만들지 않는다. 백엔드에 관련 API가 있어도 이번 프론트 범위에서는 사용하지 않는다.
- JavaScript를 기본으로 사용한다. 복잡한 타입 시스템 대신 명확한 파일 분리, Zod 검증, 테스트로 안정성을 확보한다.

Plan complete and saved to `docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`. Ready to execute?
