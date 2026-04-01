# 프론트 상태관리 정리

## 목적

이 문서는 현재 프론트가 인증 상태와 화면 상태를 어떻게 관리하는지 정리한다.
특히 auth session과 home/entry 흐름을 이해하기 쉽게 정리한다.

## 큰 구조

현재 프론트 상태관리는 크게 두 층으로 나뉜다.

1. 전역 인증 상태
- `AuthSessionProvider`

2. 화면 단위 로컬 상태
- `HomePageClient`
- `EntryFlowClient`
- 기타 개별 페이지 컴포넌트

## 인증 상태관리

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/auth/session/AuthSessionContext.jsx`
- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/auth/session/token-storage.js`

### 어떤 값을 관리하는가

- `user`
- `authError`
- `isBootstrapping`
- `apiClient`

### token 관리 방식

- refresh token
  - 브라우저 cookie로 관리
  - JS에서 직접 읽지 않음

- access token
  - `token-storage.js`의 메모리 변수로 관리
  - 필요 시 localStorage에는 user/expires 메타만 저장

### bootstrap 흐름

앱 시작 시:

1. localStorage의 `auth.sessionMeta` 읽기
2. `user`가 있으면 임시로 올림
3. `GET /api/auth/session`
4. 성공 시
   - access token 메모리 저장
   - user 상태 확정
5. 실패 시
   - 세션 초기화

즉 화면은 bootstrap이 끝날 때까지 `isBootstrapping=true` 상태를 가질 수 있다.

### refresh 흐름

- API 호출이 `401`
- `apiClient`가 `POST /api/auth/refresh`
- 성공 시 새 access token 저장
- 원래 요청 1회 재시도

### logout 흐름

- `POST /api/auth/logout`
- 서버에서 refresh cookie clear
- 프론트에서 session state clear

## 홈 상태관리

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/components/home/HomePageClient.jsx`
- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/home/api/home-api.js`

관리 값:

- `dashboard`
- `isLoading`
- `errorMessage`

동작:

- `selectedScope` 기준으로 홈 데이터 조회
- season/career summary를 둘 다 받아서 탭 전환 시 재사용
- recent games도 같이 조회

현재 주의점:

- 홈은 auth bootstrap이 끝난 뒤 조회하는 것이 중요하다
- 비로그인 상태에서 바로 `/home`에 접근하면 `/auth`로 보내는 guard가 필요하다

## 경기 생성 화면 상태관리

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/entry/components/EntryFlowClient.jsx`
- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/entry/model/entry-payload.js`

관리 값:

- 현재 step
- form draft
- validation 에러
- 저장 중 여부

동작:

- step 기반 입력 플로우
- 마지막에 draft를 backend payload로 변환
- `POST /api/games`
- 성공 시 `/home` 이동

## 현재 상태관리에서 기억할 점

- refresh token은 프론트 상태로 들고 있지 않는다
- access token은 메모리 기반이라 새로고침 후 반드시 bootstrap이 다시 필요하다
- 프론트 상태관리의 핵심은 Redux 같은 전역 라이브러리가 아니라 `AuthSessionContext + 화면별 local state` 구조다
