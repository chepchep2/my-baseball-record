# Backend Milestone 1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 카카오 로그인 기반 JWT 인증과 1차 마일스톤용 기록 생성/요약/최근 경기 조회 API를 현재 백엔드 구조 위에 맞게 구현한다.

**Architecture:** 기존 Spring Boot 계층형 구조를 유지한다. 인증은 `GET /api/auth/kakao/login -> GET /api/auth/kakao/callback -> GET /api/auth/session -> POST /api/auth/refresh -> POST /api/auth/logout` 흐름으로 정리하고, `refresh token`은 HttpOnly cookie로 관리한다. 기록/통계는 기존 game/stats 서비스를 재사용하되 1차 마일스톤 입력 모델과 응답 계약에 맞게 DTO, 계산, 검증 규칙을 재정의한다. 경기 시각의 canonical 저장 필드는 `played_at`으로 두고, 모든 game row는 현재 인증 사용자의 `user_id`에 귀속시킨다.

**Tech Stack:** Java 21, Spring Boot, Spring Security, JPA, Flyway, PostgreSQL, JUnit 5, MockMvc

---

## File Structure

### Existing auth files to modify

- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
  - Google 로그인 중심 엔드포인트를 Kakao start/callback/session/refresh/logout 구조로 교체한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
  - callback 처리, session bootstrap, refresh rotation, logout 무효화 로직을 1차 설계에 맞게 정리한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/AuthLoginResult.java`
  - `refresh token`을 JSON body에 담지 않는 구조로 맞춘다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java`
  - `accessToken`, `expiresIn`, `user` 중심 응답으로 단순화한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
  - rotation/revoke/session lookup에 필요한 조회 메서드를 확인하고 보강한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`
  - 새 callback/session/refresh/logout 경로를 보안 설정에 반영한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
  - cookie 기반 refresh/session bootstrap 에러를 공통 envelope로 매핑한다.

### Existing auth files likely to replace or remove

- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/GoogleLoginRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthRefreshRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthLogoutRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/GoogleAuthFailedException.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/InvalidGoogleTokenException.java`

### New auth files to create

- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java`
  - Kakao token exchange / user info 조회 인터페이스
- `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/KakaoOauthHttpClient.java`
  - Kakao REST API 호출 구현
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java`
  - Kakao 사용자 정보 DTO
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthSessionResponse.java`
  - `GET /api/auth/session` 응답 DTO
- `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/RefreshTokenCookieManager.java`
  - refresh cookie 생성/삭제 헬퍼
- `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/KakaoAuthConfig.java`
  - Kakao client id/secret/redirect uri 설정 바인딩

### Existing game files to modify

- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java`
  - 1차 입력 모델 기반 `POST /api/games` 계약으로 단순화한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
  - 타자 전용 생성 규칙과 응답 shape를 맞춘다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java`
  - 1차 입력값 9개 기준으로 재정의한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java`
  - 1차 화면에서 바로 쓸 수 있는 상세 응답으로 단순화한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/domain/game/BatterRecord.java`
  - 계산/검증 규칙이 분산돼 있으면 정리한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java`
  - 최근 경기 목록 조회용 쿼리를 추가한다.

### Existing stats/query files to modify

- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`
  - `scope=season|career` + 현재 사용자 기준 요약으로 단순화한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java`
  - 타자 요약 5개 지표만 반환하도록 맞춘다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`
  - `GET /api/games/recent?limit=3` 엔드포인트를 추가하거나 분리한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java`
  - 최근 경기 목록 요약 응답 생성 로직을 추가한다.

### New game/query files to create

- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java`
  - 최근 경기 카드용 풍부한 요약 응답
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java`
  - 최근 경기 목록 wrapper
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java`
  - 시즌/통산 공통 summary 응답 DTO가 기존 것과 맞지 않으면 새로 분리

### Tests to modify/create

- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java`
- `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java` (create if missing)
- `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameRecentQueryServiceTest.java` (create if split needed)

## Chunk 1: Auth Contract Reset

### Task 1: Replace Google login contract with Kakao callback-oriented auth contract

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/AuthLoginResult.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthSessionResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`

- [ ] **Step 1: Write the failing controller tests for the new auth endpoints**

Cover:
- `GET /api/auth/kakao/login` returns redirect
- `GET /api/auth/kakao/callback?code=...` sets cookie and redirects
- `GET /api/auth/session` returns `accessToken`, `expiresIn`, `user`

- [ ] **Step 2: Run the auth controller tests to verify they fail**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthControllerTest"
```

Expected:
- FAIL because new routes / response DTOs do not exist yet

- [ ] **Step 3: Replace the old Google login route and response mapping**

Implement:
- remove `POST /api/auth/google`
- add `GET /api/auth/kakao/login`
- add `GET /api/auth/kakao/callback`
- add `GET /api/auth/session`
- keep `POST /api/auth/refresh`
- keep `POST /api/auth/logout`

- [ ] **Step 4: Run controller auth tests again**

Run the same command.

Expected:
- controller route tests PASS or fail only on service wiring / cookie handling not yet implemented

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/AuthLoginResult.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthSessionResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java
git commit -m "refactor: 카카오 인증 계약으로 전환하기 위해 auth controller와 응답 dto를 수정하였습니다"
```

### Task 2: Add Kakao OAuth client and callback flow

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/KakaoOauthHttpClient.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/KakaoAuthConfig.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java`

- [ ] **Step 1: Write failing service tests for Kakao callback login**

Cover:
- code exchange success -> user create or reuse -> token issue
- Kakao user info missing/invalid -> auth exception

- [ ] **Step 2: Run the auth service tests to verify they fail**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.service.auth.AuthServiceTest"
```

Expected:
- FAIL because Kakao client abstraction and callback login path are not implemented

- [ ] **Step 3: Implement the Kakao client abstraction and callback login service**

Implementation notes:
- `AuthService` should no longer depend on `GoogleTokenVerifier`
- add a dedicated callback login method that accepts `authorizationCode`
- map Kakao user info to existing `User` domain
- callback 이후 프론트 bootstrap 흐름을 위해 redirect target과 cookie set 시점을 함께 정리한다

- [ ] **Step 4: Run the auth service tests again**

Expected:
- PASS for callback login flow

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/KakaoOauthHttpClient.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/KakaoAuthConfig.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java
git commit -m "feat: 카카오 callback 로그인 처리를 추가하기 위해 auth service와 oauth client를 구현하였습니다"
```

### Task 3: Move refresh token handling to HttpOnly cookie

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/RefreshTokenCookieManager.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java`

- [ ] **Step 1: Write failing tests for cookie-based session bootstrap, refresh, and logout**

Cover:
- `GET /api/auth/session` reads refresh cookie and returns access token + user
- `POST /api/auth/refresh` reads refresh cookie with no body
- `POST /api/auth/logout` clears cookie and revokes stored token

- [ ] **Step 2: Run the auth refresh/logout tests to verify they fail**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthRefreshControllerTest" --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthLogoutControllerTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthRefreshServiceTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthLogoutServiceTest"
```

Expected:
- FAIL because request-body refresh/logout and session bootstrap assumptions still exist

- [ ] **Step 3: Implement cookie extraction, rotation, revoke, and session bootstrap**

Implementation notes:
- remove refresh/logout request bodies from controller contract
- use `RefreshTokenCookieManager` for set/clear logic
- keep DB-backed refresh token validation and rotation
- frontend auth/session requests must work with `credentials: include`
- backend CORS and cookie policy must allow credential-based refresh/session bootstrap

- [ ] **Step 4: Run the same auth refresh/logout tests again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/RefreshTokenCookieManager.java backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java
git commit -m "feat: refresh token cookie 기반 세션 유지를 구현하기 위해 auth refresh와 logout 흐름을 수정하였습니다"
```

## Chunk 2: Game Create V1 Reset

### Task 4: Reset the game create request to the milestone-1 batter-only schema

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`

- [ ] **Step 1: Write failing controller tests for the new create request shape**

Cover:
- accepts `playedDate`, `playedHour`, `playedMinute`
- accepts batter-only input fields
- rejects old nested request shape

- [ ] **Step 2: Run the game create controller test to verify it fails**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameCreateControllerTest"
```

Expected:
- FAIL because current request DTO is still broad v1 shape

- [ ] **Step 3: Replace the request DTO and controller contract**

Implementation notes:
- remove pitcher/team/memo/etc from create request
- enforce integer and range validation at DTO level where practical
- request의 `playedDate`, `playedHour`, `playedMinute`는 저장 시 `played_at`으로 합친다
- `userId`는 요청에서 받지 않고 JWT subject 기준으로 결정한다

- [ ] **Step 4: Run the controller test again**

Expected:
- PASS or fail only on service calculation rules not yet updated

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java
git commit -m "refactor: 1차 타자 기록 입력 계약에 맞추기 위해 game create request를 단순화하였습니다"
```

### Task 5: Move batter validation and calculation rules into the game create service/domain

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/domain/game/BatterRecord.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`

- [ ] **Step 1: Write failing service tests for milestone-1 create rules**

Cover:
- all numbers are non-negative integers
- no future date
- no future time when playedDate is today
- walksAndHitByPitch <= plateAppearances
- hits sum <= atBats
- computed stats match spec

- [ ] **Step 2: Run the game create service test to verify it fails**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.service.game.GameCreateServiceTest"
```

Expected:
- FAIL on validation/calculation mismatches

- [ ] **Step 3: Implement the minimal validation and calculation logic**

Implementation notes:
- keep server-side validation even if frontend already validates
- centralize stat math close to batter domain/service logic
- 최근 경기 정렬과 시즌 집계가 흔들리지 않도록 `played_at`을 기준 필드로 사용한다

- [ ] **Step 4: Run the service test again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java backend/src/main/java/com/chepchep2/mybaseballrecord/domain/game/BatterRecord.java backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java
git commit -m "feat: 타자 기록 계산과 검증 규칙을 고정하기 위해 game create 서비스를 수정하였습니다"
```

### Task 6: Return the milestone-1 game detail response

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`

- [ ] **Step 1: Write a failing test for the response shape**

Cover:
- `gameId`
- `playedDate`, `playedHour`, `playedMinute`, `playedAtLabel`
- all input fields
- all computed fields

- [ ] **Step 2: Run the game create controller test to verify it fails**

Run the same controller test command.

- [ ] **Step 3: Simplify `GameDetailResponse` and mapper logic**

Implementation notes:
- optimize for current frontend and future detail reuse
- do not keep unrelated pitcher/team fields in the milestone-1 create response

- [ ] **Step 4: Run the controller test again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java
git commit -m "refactor: 1차 경기 상세 응답을 맞추기 위해 game detail response를 정리하였습니다"
```

## Chunk 3: Stats Summary and Recent Games

### Task 7: Simplify stats summary to season/career batter summary only

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java`
- Modify or Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java`

- [ ] **Step 1: Write failing tests for `GET /api/stats?scope=season|career`**

Cover:
- no recordType/gameFilter required in 1차
- current user only
- returns `battingAverage`, `ops`, `hits`, `onBasePercentage`, `sluggingPercentage`

- [ ] **Step 2: Run the stats tests to verify they fail**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.stats.StatsQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.stats.StatsQueryServiceTest"
```

Expected:
- FAIL because current stats endpoint expects broader query params and response shapes

- [ ] **Step 3: Implement the simplified stats query contract**

Implementation notes:
- keep season/career under one endpoint with `scope`
- derive season year internally for season scope if needed

- [ ] **Step 4: Run the same stats tests again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java
git commit -m "refactor: 1차 홈 요약 조회 계약을 맞추기 위해 stats query를 단순화하였습니다"
```

### Task 8: Add the recent games query API

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameRecentQueryServiceTest.java`

- [ ] **Step 1: Write failing tests for `GET /api/games/recent?limit=3`**

Cover:
- current user only
- ordered by playedAt desc
- limit parameter respected
- each item includes input + computed summary fields

- [ ] **Step 2: Run the recent games tests to verify they fail**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameRecentQueryServiceTest"
```

Expected:
- FAIL because recent endpoint and DTOs do not exist yet

- [ ] **Step 3: Implement repository query, service mapping, and controller endpoint**

Implementation notes:
- keep detail endpoint if it already exists
- add `recent` as a sibling read endpoint
- return a wrapper object with `items`
- ordering must be `played_at DESC`, not `created_at DESC`
- all recent items are filtered by the authenticated user's `user_id`

- [ ] **Step 4: Run the recent games tests again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameRecentQueryServiceTest.java
git commit -m "feat: 최근 경기 목록 조회를 제공하기 위해 recent games query api를 추가하였습니다"
```

## Chunk 4: Config, Security, and Final Verification

### Task 9: Wire Kakao config and secure routes

**Files:**
- Modify: `backend/src/main/resources/application.properties`
- Modify: `backend/src/main/resources/application-local.properties`
- Modify: `backend/src/main/resources/application-prod.properties`
- Modify: `backend/.env.example`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`

- [ ] **Step 1: Write failing auth/security tests for the new public/protected route map**

Cover:
- `/api/auth/kakao/login`, `/api/auth/kakao/callback`, `/api/auth/session`, `/api/auth/refresh` route behavior
- game/stats endpoints remain protected by access token

- [ ] **Step 2: Run auth controller tests to verify they fail**

Run the auth controller test command from Task 1.

- [ ] **Step 3: Add Kakao config properties and security route updates**

Implementation notes:
- add placeholders for client id/secret/redirect uri
- document local/prod env names clearly
- document cookie `Domain`, `SameSite`, `Secure`, and credential-based CORS assumptions clearly

- [ ] **Step 4: Run auth controller tests again**

Expected:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/application.properties backend/src/main/resources/application-local.properties backend/src/main/resources/application-prod.properties backend/.env.example backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java
git commit -m "chore: 카카오 인증 설정과 보안 경로를 정리하기 위해 config를 수정하였습니다"
```

### Task 10: Run the focused backend verification suite

**Files:**
- Modify: none expected unless tests expose gaps
- Test:
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/*`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/*`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java`
  - `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java`

- [ ] **Step 1: Run the focused suite**

```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.*" --tests "com.chepchep2.mybaseballrecord.service.auth.*" --tests "com.chepchep2.mybaseballrecord.controller.game.GameCreateControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameCreateServiceTest" --tests "com.chepchep2.mybaseballrecord.controller.stats.StatsQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.stats.StatsQueryServiceTest" --tests "com.chepchep2.mybaseballrecord.controller.game.GameQueryControllerTest"
```

Expected:
- PASS

- [ ] **Step 2: Run compile check**

```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew compileJava
```

Expected:
- `BUILD SUCCESSFUL`

- [ ] **Step 3: Commit final verification fixes if needed**

```bash
git add backend
git commit -m "test: 백엔드 1차 인증과 기록 조회 검증을 마무리하기 위해 테스트를 정리하였습니다"
```

## Notes For Execution

- 기존 Google 로그인 관련 코드가 많으므로, 새 Kakao 흐름을 붙일 때는 “공존”보다 “계약을 새 설계에 맞게 교체”하는 쪽으로 간다.
- refresh token은 더 이상 JSON body로 주고받지 않는다.
- `GET /api/auth/session`은 프론트가 callback 리다이렉트 이후 초기 access token과 user 정보를 받는 용도다.
- 프론트 인증 관련 요청은 `credentials: include`를 사용한다.
- backend CORS는 credential 요청을 허용해야 한다.
- `GET /api/stats?scope=season|career`는 현재 사용자 기준으로만 동작한다.
- `GET /api/games/recent?limit=3`는 목록 API이고, 상세 조회 API와 응답 책임이 다르다.
- 최근 경기 목록의 recent는 최근 생성 순이 아니라 실제 경기 시각 `played_at DESC`를 의미한다.

Plan complete and saved to `docs/milestone-1/2026-03-27-backend-implementation-plan.md`. Ready to execute?
