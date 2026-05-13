# 백엔드 API 구조

## 목적

이 문서는 현재 백엔드가 어떤 엔드포인트를 제공하고, 내부 계층이 어떻게 나뉘는지 정리한다.
새 API를 추가하거나 리뷰할 때 빠르게 기준점을 잡기 위한 문서다.

## 계층 구조

현재 백엔드는 아래 계층을 따른다.

1. controller
- HTTP endpoint
- request binding
- response 반환

2. service
- 유스케이스 처리
- 검증/규칙/조합

3. domain
- 엔티티
- 불변 필드/변경 규칙

4. repository
- DB 접근

## 인증 API

컨트롤러:

- `/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`

엔드포인트:

- `GET /api/auth/kakao/login`
- `GET /api/auth/kakao/callback`
- `GET /api/auth/session`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

인증 구조:

- 카카오 OAuth code -> backend callback
- backend가 자체 JWT access/refresh 발급
- refresh는 cookie
- access는 응답 바디

## 게임 명령 API

컨트롤러:

- `/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java`

엔드포인트:

- `POST /api/games`
- `PUT /api/games/{gameId}`
- `DELETE /api/games/{gameId}`

현재 milestone-1 핵심:

- `POST /api/games`

현재 create 계약:

- `playedDate`
- `playedHour`
- `playedMinute`
- `plateAppearances`
- `walksAndHitByPitch`
- `singles`
- `doubles`
- `triples`
- `homeRuns`

서버 계산:

- `played_at`
- `atBats`
- `hits`
- `battingAverage`
- `onBasePercentage`
- `sluggingPercentage`
- `ops`

## 게임 조회 API

컨트롤러:

- `/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`

엔드포인트:

- `GET /api/games/{gameId}`
- `GET /api/games/recent?limit=3`

현재 milestone-1 핵심:

- `GET /api/games/recent?limit=3`

## 통계 API

컨트롤러:

- `/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`

엔드포인트:

- `GET /api/stats?scope=season|career`

현재 역할:

- 홈 화면용 단순 요약 통계 제공
- season/career 두 범위 지원

현재 홈 화면 summary 기준 필드:

- `games`
- `plateAppearances`
- `walksAndHitByPitch`
- `hits`
- `battingAverage`
- `ops`
- `onBasePercentage`
- `sluggingPercentage`

## 현재 인증 방식

### 세션 복구

- `GET /api/auth/session`
- 입력: `refreshToken` cookie
- 출력: `accessToken`, `expiresIn`, `user`

### 일반 보호 API

- 입력: `Authorization: Bearer <accessToken>`
- 대상:
  - `/api/games`
  - `/api/games/recent`
  - `/api/stats`

## 현재 API를 볼 때 기억할 점

- refresh token과 access token 사용 방식이 다르다
- 게임 create는 flat request 기준으로 정리된 최신 계약을 본다
- stats는 홈 화면의 8개 요약 지표를 바로 그릴 수 있는 summary 응답을 제공한다
- recent는 홈 화면 요구사항에 맞춘 최근 경기 목록 응답을 제공한다
- update/delete/detail은 존재하지만, milestone-1 프론트 주요 흐름은 create/home 중심이다

## TODO

- `created_at`, `updated_at`은 운영/감사 성격의 절대 시점이므로 `TIMESTAMPTZ` 통일을 검토한다.
- `played_at`은 현재 경기 로컬 시각 저장 목적으로 `TIMESTAMP`를 쓰고 있지만, 이후 다국가/다시간대 확장 계획이 생기면 `TIMESTAMPTZ` 전환 여부를 다시 판단한다.
- `auth_user`에는 아직 `created_at`, `updated_at`, `last_login_at`이 없다. 인증/운영 추적을 위해 auth 스키마 확장 후보로 유지한다.
