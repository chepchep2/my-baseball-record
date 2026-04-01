# 프론트 API 연결 구조

## 목적

이 문서는 프론트가 백엔드 API를 어떤 구조로 호출하는지 정리한다.
새로운 API를 붙일 때 어디를 수정해야 하는지 빠르게 찾기 위한 문서다.

## 기본 계층

현재 프론트 API 연결은 대체로 아래 구조를 따른다.

1. `api-client`
2. feature 단위 API 함수
3. page/client component
4. view-model 변환

즉 흐름은 보통:

`component -> feature api -> apiClient -> backend`

## 공통 HTTP 클라이언트

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/lib/http/api-client.js`

역할:

- base URL 결정
- `Authorization` 헤더 부착
- `credentials: "include"` 적용
- `401` 시 refresh 후 1회 재시도
- 공통 에러를 `ApiError`로 변환

### base URL 결정 규칙

1. `NEXT_PUBLIC_API_BASE_URL`이 있으면 그 값을 사용
2. 로컬에서 `localhost` / `127.0.0.1`이면 `:8080` fallback
3. 그 외엔 빈 문자열

즉:

- 배포: env 기반
- 로컬: fallback 기반

## 인증 API

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/auth/api/auth-api.js`

역할:

- 카카오 로그인 시작 URL 생성
- session 조회
- refresh
- logout

특징:

- auth 관련 초기 요청은 `auth-api.js`
- 일반 보호 API 호출은 `api-client.js`

## 홈 API

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/home/api/home-api.js`

역할:

- `GET /api/stats?scope=season`
- `GET /api/stats?scope=career`
- `GET /api/games/recent?limit=3`
를 한 번에 조회

특징:

- home용 view-model로 변환하기 전 원본 요청을 모으는 계층

## 게임 API

핵심 파일:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/games/api/games-api.js`

역할:

- `GET /api/games/{id}`
- `POST /api/games`
- `PUT /api/games/{id}`
- `DELETE /api/games/{id}`

현재 milestone-1에서 실제 활발히 쓰는 것은:

- create
- recent/home 조회

## view-model 변환

예:

- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/home/model/home-view-model.js`
- `/Users/chosangwoo/dev/projects/my-baseball-record/frontend/src/features/games/model/game-detail-view-model.js`

역할:

- backend 응답 shape를 화면이 쓰기 쉬운 shape로 바꾼다

이 계층이 필요한 이유:

- 백엔드 응답이 바뀌더라도 UI 전체를 직접 고치지 않도록 하기 위해서다

## 새 API를 붙일 때 수정 순서

1. backend request/response shape 확인
2. feature api 함수 추가
3. 필요하면 view-model 추가/수정
4. page/client component 연결
5. 테스트 추가

## 현재 기억할 점

- 프론트는 mock store보다 실제 API 호출 구조로 이미 상당 부분 전환돼 있다
- auth/session 흐름과 일반 API 호출 흐름은 파일이 다르다
- 새 엔드포인트를 붙일 땐 `api-client`를 직접 컴포넌트에서 쓰기보다 feature api를 거치는 것이 좋다
