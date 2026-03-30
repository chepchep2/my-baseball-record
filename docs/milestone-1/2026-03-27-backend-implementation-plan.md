# 백엔드 1차 마일스톤 구현 계획

> **에이전트 작업 원칙:** 이 계획을 구현할 때는 `superpowers:executing-plans`를 사용한다. 진행 체크는 체크박스(`- [ ]`) 형식으로 기록한다.

**목표:** 카카오 로그인 기반 JWT 인증과 1차 마일스톤용 기록 생성/요약/최근 경기 조회 API를 현재 백엔드 구조 위에 맞게 구현한다.

**아키텍처:** 기존 Spring Boot 계층형 구조를 유지한다. 인증은 `GET /api/auth/kakao/login -> GET /api/auth/kakao/callback -> GET /api/auth/session -> POST /api/auth/refresh -> POST /api/auth/logout` 흐름으로 정리하고, `refresh token`은 HttpOnly cookie로 관리한다. 기록/통계는 기존 game/stats 서비스를 재사용하되 1차 마일스톤 입력 모델과 응답 계약에 맞게 DTO, 계산, 검증 규칙을 재정의한다. 경기 시각의 canonical 저장 필드는 `played_at`으로 두고, 모든 game row는 현재 인증 사용자의 `user_id`에 귀속시킨다.

**기술 스택:** Java 21, Spring Boot, Spring Security, JPA, Flyway, PostgreSQL, JUnit 5, MockMvc

---

## 파일 구조

### 수정할 기존 auth 파일

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

### 교체하거나 제거할 가능성이 높은 기존 auth 파일

- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/GoogleLoginRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthRefreshRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthLogoutRequest.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/GoogleAuthFailedException.java`
- `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/InvalidGoogleTokenException.java`

### 새로 만들 auth 파일

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

### 수정할 기존 game 파일

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

### 수정할 기존 stats/query 파일

- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`
  - `scope=season|career` + 현재 사용자 기준 요약으로 단순화한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java`
  - 타자 요약 5개 지표만 반환하도록 맞춘다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`
  - `GET /api/games/recent?limit=3` 엔드포인트를 추가하거나 분리한다.
- `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java`
  - 최근 경기 목록 요약 응답 생성 로직을 추가한다.

### 새로 만들 game/query 파일

- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java`
  - 최근 경기 카드용 풍부한 요약 응답
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java`
  - 최근 경기 목록 wrapper
- `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java`
  - 시즌/통산 공통 summary 응답 DTO가 기존 것과 맞지 않으면 새로 분리

### 수정하거나 새로 만들 테스트

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

## Chunk 1: Auth 계약 재정의

### Task 1: Google 로그인 계약을 Kakao callback 중심 auth 계약으로 교체

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/AuthLoginResult.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthSessionResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`

- [ ] **Step 1: 새 auth 엔드포인트에 대한 실패 테스트를 먼저 작성한다**

검증 항목:
- `GET /api/auth/kakao/login` returns redirect
- `GET /api/auth/kakao/callback?code=...` sets cookie and redirects
- `GET /api/auth/session` returns `accessToken`, `expiresIn`, `user`

- [ ] **Step 2: auth controller 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthControllerTest"
```

기대 결과:
- FAIL because new routes / response DTOs do not exist yet

- [ ] **Step 3: 기존 Google 로그인 라우트와 응답 매핑을 새 계약으로 교체한다**

구현 항목:
- remove `POST /api/auth/google`
- add `GET /api/auth/kakao/login`
- add `GET /api/auth/kakao/callback`
- add `GET /api/auth/session`
- keep `POST /api/auth/refresh`
- keep `POST /api/auth/logout`

- [ ] **Step 4: controller auth 테스트를 다시 실행한다**

Run the same command.

기대 결과:
- controller route tests PASS or fail only on service wiring / cookie handling not yet implemented

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/AuthLoginResult.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthSessionResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java
git commit -m "refactor: 카카오 인증 계약으로 전환하기 위해 auth controller와 응답 dto를 수정하였습니다"
```

### Task 2: Kakao OAuth client와 callback 흐름 추가

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/KakaoOauthHttpClient.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/KakaoAuthConfig.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java`

- [ ] **Step 1: Kakao callback 로그인에 대한 실패 서비스 테스트를 먼저 작성한다**

검증 항목:
- code exchange success -> user create or reuse -> token issue
- Kakao user info missing/invalid -> auth exception

- [ ] **Step 2: auth service 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.service.auth.AuthServiceTest"
```

기대 결과:
- FAIL because Kakao client abstraction and callback login path are not implemented

- [ ] **Step 3: Kakao client 추상화와 callback 로그인 서비스를 구현한다**

구현 메모:
- `AuthService` should no longer depend on `GoogleTokenVerifier`
- add a dedicated callback login method that accepts `authorizationCode`
- map Kakao user info to existing `User` domain
- callback 이후 프론트 bootstrap 흐름을 위해 redirect target과 cookie set 시점을 함께 정리한다

- [ ] **Step 4: auth service 테스트를 다시 실행한다**

기대 결과:
- PASS for callback login flow

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/KakaoOauthHttpClient.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/KakaoAuthConfig.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java
git commit -m "feat: 카카오 callback 로그인 처리를 추가하기 위해 auth service와 oauth client를 구현하였습니다"
```

### Task 3: refresh token 처리 방식을 HttpOnly cookie로 전환

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/RefreshTokenCookieManager.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java`

- [ ] **Step 1: cookie 기반 session bootstrap, refresh, logout 실패 테스트를 먼저 작성한다**

검증 항목:
- `GET /api/auth/session` reads refresh cookie and returns access token + user
- `POST /api/auth/refresh` reads refresh cookie with no body
- `POST /api/auth/logout` clears cookie and revokes stored token

- [ ] **Step 2: auth refresh/logout 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthRefreshControllerTest" --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthLogoutControllerTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthRefreshServiceTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthLogoutServiceTest"
```

기대 결과:
- FAIL because request-body refresh/logout and session bootstrap assumptions still exist

- [ ] **Step 3: cookie 추출, rotation, revoke, session bootstrap을 구현한다**

구현 메모:
- remove refresh/logout request bodies from controller contract
- use `RefreshTokenCookieManager` for set/clear logic
- keep DB-backed refresh token validation and rotation
- frontend auth/session requests must work with `credentials: include`
- backend CORS and cookie policy must allow credential-based refresh/session bootstrap

- [ ] **Step 4: 같은 auth refresh/logout 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/RefreshTokenCookieManager.java backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java
git commit -m "feat: refresh token cookie 기반 세션 유지를 구현하기 위해 auth refresh와 logout 흐름을 수정하였습니다"
```

## Chunk 2: Game Create V1 재정의

### Task 4: game create request를 1차 타자 전용 스키마로 재정의

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`

- [ ] **Step 1: 새 create request shape에 대한 실패 controller 테스트를 먼저 작성한다**

검증 항목:
- accepts `playedDate`, `playedHour`, `playedMinute`
- accepts batter-only input fields
- rejects old nested request shape

- [ ] **Step 2: game create controller 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameCreateControllerTest"
```

기대 결과:
- FAIL because current request DTO is still broad v1 shape

- [ ] **Step 3: request DTO와 controller 계약을 교체한다**

구현 메모:
- remove pitcher/team/memo/etc from create request
- enforce integer and range validation at DTO level where practical
- request의 `playedDate`, `playedHour`, `playedMinute`는 저장 시 `played_at`으로 합친다
- `userId`는 요청에서 받지 않고 JWT subject 기준으로 결정한다

- [ ] **Step 4: controller 테스트를 다시 실행한다**

기대 결과:
- PASS or fail only on service calculation rules not yet updated

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java
git commit -m "refactor: 1차 타자 기록 입력 계약에 맞추기 위해 game create request를 단순화하였습니다"
```

### Task 5: 타자 검증과 계산 규칙을 game create service/domain으로 이동

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/domain/game/BatterRecord.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`

- [ ] **Step 1: 1차 create 규칙에 대한 실패 서비스 테스트를 먼저 작성한다**

검증 항목:
- all numbers are non-negative integers
- no future date
- no future time when playedDate is today
- walksAndHitByPitch <= plateAppearances
- hits sum <= atBats
- computed stats match spec

- [ ] **Step 2: game create service 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.service.game.GameCreateServiceTest"
```

기대 결과:
- FAIL on validation/calculation mismatches

- [ ] **Step 3: 최소 검증 및 계산 로직을 구현한다**

구현 메모:
- keep server-side validation even if frontend already validates
- centralize stat math close to batter domain/service logic
- 최근 경기 정렬과 시즌 집계가 흔들리지 않도록 `played_at`을 기준 필드로 사용한다

- [ ] **Step 4: service 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java backend/src/main/java/com/chepchep2/mybaseballrecord/domain/game/BatterRecord.java backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java
git commit -m "feat: 타자 기록 계산과 검증 규칙을 고정하기 위해 game create 서비스를 수정하였습니다"
```

### Task 6: 1차 마일스톤용 game detail 응답 반환

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`

- [ ] **Step 1: 응답 shape에 대한 실패 테스트를 먼저 작성한다**

검증 항목:
- `gameId`
- `playedDate`, `playedHour`, `playedMinute`, `playedAtLabel`
- all input fields
- all computed fields

- [ ] **Step 2: game create controller 테스트가 실제로 실패하는지 확인한다**

Run the same controller test command.

- [ ] **Step 3: `GameDetailResponse`와 mapper 로직을 단순화한다**

구현 메모:
- optimize for current frontend and future detail reuse
- do not keep unrelated pitcher/team fields in the milestone-1 create response

- [ ] **Step 4: controller 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java
git commit -m "refactor: 1차 경기 상세 응답을 맞추기 위해 game detail response를 정리하였습니다"
```

## Chunk 3: Stats 요약과 최근 경기 조회

### Task 7: stats summary를 시즌/통산 타자 요약만 남기도록 단순화

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java`
- Modify or Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java`

- [ ] **Step 1: `GET /api/stats?scope=season|career` 실패 테스트를 먼저 작성한다**

검증 항목:
- no recordType/gameFilter required in 1차
- current user only
- returns `battingAverage`, `ops`, `hits`, `onBasePercentage`, `sluggingPercentage`

- [ ] **Step 2: stats 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.stats.StatsQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.stats.StatsQueryServiceTest"
```

기대 결과:
- FAIL because current stats endpoint expects broader query params and response shapes

- [ ] **Step 3: 단순화된 stats query 계약을 구현한다**

구현 메모:
- keep season/career under one endpoint with `scope`
- derive season year internally for season scope if needed

- [ ] **Step 4: 같은 stats 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsSummaryResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java
git commit -m "refactor: 1차 홈 요약 조회 계약을 맞추기 위해 stats query를 단순화하였습니다"
```

### Task 8: 최근 경기 조회 API 추가

**Files:**
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameRecentQueryServiceTest.java`

- [ ] **Step 1: `GET /api/games/recent?limit=3` 실패 테스트를 먼저 작성한다**

검증 항목:
- current user only
- ordered by playedAt desc
- limit parameter respected
- each item includes input + computed summary fields

- [ ] **Step 2: recent games 테스트가 실제로 실패하는지 확인한다**

Run:
```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameRecentQueryServiceTest"
```

기대 결과:
- FAIL because recent endpoint and DTOs do not exist yet

- [ ] **Step 3: repository query, service mapping, controller endpoint를 구현한다**

구현 메모:
- keep detail endpoint if it already exists
- add `recent` as a sibling read endpoint
- return a wrapper object with `items`
- ordering must be `played_at DESC`, not `created_at DESC`
- all recent items are filtered by the authenticated user's `user_id`

- [ ] **Step 4: recent games 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGameItemResponse.java backend/src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/RecentGamesResponse.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryControllerTest.java backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/GameRecentQueryServiceTest.java
git commit -m "feat: 최근 경기 목록 조회를 제공하기 위해 recent games query api를 추가하였습니다"
```

## Chunk 4: Config, Security, 최종 검증

### Task 9: Kakao config와 보안 경로 연결

**Files:**
- Modify: `backend/src/main/resources/application.properties`
- Modify: `backend/src/main/resources/application-local.properties`
- Modify: `backend/src/main/resources/application-prod.properties`
- Modify: `backend/.env.example`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Test: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`

- [ ] **Step 1: 새 public/protected route map에 대한 실패 auth/security 테스트를 먼저 작성한다**

검증 항목:
- `/api/auth/kakao/login`, `/api/auth/kakao/callback`, `/api/auth/session`, `/api/auth/refresh` route behavior
- game/stats endpoints remain protected by access token

- [ ] **Step 2: auth controller 테스트가 실제로 실패하는지 확인한다**

Run the auth controller test command from Task 1.

- [ ] **Step 3: Kakao config properties와 security route를 추가한다**

구현 메모:
- add placeholders for client id/secret/redirect uri
- document local/prod env names clearly
- document cookie `Domain`, `SameSite`, `Secure`, and credential-based CORS assumptions clearly

- [ ] **Step 4: auth controller 테스트를 다시 실행한다**

기대 결과:
- PASS

- [ ] **Step 5: Commit**

```bash
git add backend/src/main/resources/application.properties backend/src/main/resources/application-local.properties backend/src/main/resources/application-prod.properties backend/.env.example backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java
git commit -m "chore: 카카오 인증 설정과 보안 경로를 정리하기 위해 config를 수정하였습니다"
```

### Task 10: 백엔드 핵심 검증 세트를 실행한다

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

- [ ] **Step 1: 핵심 검증 세트를 실행한다**

```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.*" --tests "com.chepchep2.mybaseballrecord.service.auth.*" --tests "com.chepchep2.mybaseballrecord.controller.game.GameCreateControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameCreateServiceTest" --tests "com.chepchep2.mybaseballrecord.controller.stats.StatsQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.stats.StatsQueryServiceTest" --tests "com.chepchep2.mybaseballrecord.controller.game.GameQueryControllerTest"
```

기대 결과:
- PASS

- [ ] **Step 2: compile 체크를 실행한다**

```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew compileJava
```

기대 결과:
- `BUILD SUCCESSFUL`

- [ ] **Step 3: 필요하면 최종 검증 수정사항을 커밋한다**

```bash
git add backend
git commit -m "test: 백엔드 1차 인증과 기록 조회 검증을 마무리하기 위해 테스트를 정리하였습니다"
```

## 실행 메모

- 기존 Google 로그인 관련 코드가 많으므로, 새 Kakao 흐름을 붙일 때는 “공존”보다 “계약을 새 설계에 맞게 교체”하는 쪽으로 간다.
- refresh token은 더 이상 JSON body로 주고받지 않는다.
- `GET /api/auth/session`은 프론트가 callback 리다이렉트 이후 초기 access token과 user 정보를 받는 용도다.
- 프론트 인증 관련 요청은 `credentials: include`를 사용한다.
- backend CORS는 credential 요청을 허용해야 한다.
- `GET /api/stats?scope=season|career`는 현재 사용자 기준으로만 동작한다.
- `GET /api/games/recent?limit=3`는 목록 API이고, 상세 조회 API와 응답 책임이 다르다.
- 최근 경기 목록의 recent는 최근 생성 순이 아니라 실제 경기 시각 `played_at DESC`를 의미한다.

이 계획은 `docs/milestone-1/2026-03-27-backend-implementation-plan.md`에 저장되어 있으며, 바로 구현에 사용할 수 있다.
