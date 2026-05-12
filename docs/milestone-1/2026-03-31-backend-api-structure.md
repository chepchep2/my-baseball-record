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
- `GET /api/games?year=<yyyy>&month=<mm>`
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
- seasonYear, recordType, gameFilter query 조합 지원

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
- stats/recent는 홈 화면 요구사항에 맞춘 최소 응답 중심이다
- update/delete/detail과 월별 경기 목록도 현재 프론트 흐름에서 사용한다

## 배포 기준 메모

- 기준 브랜치: `main`
- 현재 공개 백엔드는 `https://api.mybaseball.cloud`
- 인증 없는 `GET /api/auth/session` 호출은 `401`이 정상이다
