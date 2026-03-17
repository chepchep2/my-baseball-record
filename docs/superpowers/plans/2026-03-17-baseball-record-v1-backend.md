# Baseball Record V1 Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 백엔드를 새로 구성해 Google 로그인 기반 인증, 앱 내부 access token / refresh token 세션, 경기 원자적 저장, 시즌/통산 통합 기록 조회 API를 제공한다.

**Architecture:** `backend/` 아래에 Spring Boot + Java 애플리케이션을 구성하고, `domain`, `application`, `infrastructure`, `presentation` 레이어 기준으로 `auth`, `game`, `stats` 도메인을 나눈다. 인증은 Google `idToken` 검증 후 앱 내부 세션 토큰을 발급하는 구조로 설계하고, 경기 저장은 사용자가 보는 하나의 저장 행동과 일치하도록 원자적 저장 API로 제공한다.

**Tech Stack:** Java 21, Spring Boot, Spring Security, Spring Web, Spring Data JPA, Validation, PostgreSQL, Flyway, JUnit 5, Spring Boot Test, Testcontainers, AssertJ, JWT

**Auth Policy:** Google 로그인만 지원한다. Google 계정 1개는 앱 계정 1개와 연결되며, 서로 다른 Google 계정은 서로 다른 앱 계정으로 취급한다. v1은 계정 연결과 계정 병합을 지원하지 않는다.

---

## Scope Source

이 계획은 아래 문서를 구현하는 용도다.

- `docs/prd.md`
- `docs/superpowers/specs/2026-03-17-scenario-v1.md`
- `docs/superpowers/specs/2026-03-16-baseball-record-v1-design.md`
- `docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- `docs/superpowers/specs/2026-03-17-api-contract-v1.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-overview.md`

이 계획은 새 제품 범위를 추가하지 않는다.

## Scope Summary

백엔드 v1에 포함한다.

- Google 로그인 검증
- 앱 내부 access token / refresh token 발급
- refresh token 회전과 무효화
- 개인 사용자 레코드 생성/조회
- 경기 원자적 저장 API
- 시즌/통산/시즌 선택 통합 기록 조회 API
- 공통 validation error 응답

백엔드 v1에서 제외한다.

- 이메일/비밀번호 인증
- 최근 경기 API
- 팀/공동 입력 API
- 외부 기록 연동
- 상세 로그 API

## Assumptions

- `backend/` 아래에 새 Spring Boot 프로젝트를 만든다.
- Google 로그인 후 백엔드가 받는 값은 우선 `idToken` 기준으로 계획한다.
- 저장 API는 `POST /api/games` 하나의 원자적 저장 엔드포인트를 사용한다.
- Game은 사용자 개인 소유 경기 기록 단위다.
- refresh token은 DB에 저장하고 무효화 가능해야 한다.
- 통계 비율 지표는 API 계약의 반올림 규칙을 따른다.

## File Structure

### Project Setup

- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/gradle.properties`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/test/resources/application-test.yml`

### App Bootstrap

- Create: `backend/src/main/java/com/mybaseballrecord/BaseballRecordApplication.java`

### Common

- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/ApiErrorResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/FieldErrorItem.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/common/SeasonResolver.java`

### Auth Domain

- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/User.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthIdentity.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/RefreshToken.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/UserRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/AuthIdentityRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/RefreshTokenRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtProperties.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/CurrentUser.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/google/GoogleTokenVerifier.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/GoogleAuthService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/TokenRefreshService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/AuthController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/GoogleLoginRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/RefreshTokenRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/LogoutRequest.java`

### Game Domain

- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/Game.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/GameType.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/BatterRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/PitcherRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/GameRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/BatterRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/PitcherRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameSaveService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/GameController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/SaveGameRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/GameInfoRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/BatterRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/PitcherRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/SaveGameResponse.java`

### Stats Domain

- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/BatterStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/PitcherStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/stats/StatsQueryService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/StatsController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/StatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterSummaryResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterDetailResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherSummaryResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherDetailResponse.java`

### Database

- Create: `backend/src/main/resources/db/migration/V1__create_auth_tables.sql`
- Create: `backend/src/main/resources/db/migration/V2__create_game_tables.sql`

### Tests

- Create: `backend/src/test/java/com/mybaseballrecord/BaseballRecordApplicationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/auth/AuthDomainPersistenceTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/auth/GoogleAuthControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/auth/TokenRefreshServiceTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/game/GameSaveServiceTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/BatterStatsCalculatorTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/PitcherStatsCalculatorTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/StatsControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/support/PostgresContainerTest.java`

## Chunk 1: Project Bootstrap

### Task 1: Spring Boot 백엔드 프로젝트를 부트스트랩한다

**Files:**
- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/gradle.properties`
- Create: `backend/src/main/java/com/mybaseballrecord/BaseballRecordApplication.java`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/test/resources/application-test.yml`
- Test: `backend/src/test/java/com/mybaseballrecord/BaseballRecordApplicationTest.java`

- [ ] **Step 1: 실패하는 context load 테스트를 작성한다**

```java
@SpringBootTest
class BaseballRecordApplicationTest {
    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.BaseballRecordApplicationTest`
Expected: Gradle 프로젝트 또는 애플리케이션 클래스가 없어 FAIL

- [ ] **Step 3: 최소 Spring Boot 프로젝트를 만든다**

필수 의존성:
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `flyway-core`
- `postgresql`
- `jjwt-api` 및 구현체
- `spring-boot-starter-test`
- `testcontainers-postgresql`

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.BaseballRecordApplicationTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend
git commit -m "기능: 스프링 부트 백엔드 초기 구성"
```

## Chunk 2: Google Auth And Session

### Task 2: 사용자, Google identity, refresh token 모델을 만든다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/User.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthIdentity.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/RefreshToken.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/UserRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/AuthIdentityRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/RefreshTokenRepository.java`
- Create: `backend/src/main/resources/db/migration/V1__create_auth_tables.sql`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/AuthDomainPersistenceTest.java`

- [ ] **Step 1: 실패하는 영속성 테스트를 작성한다**

검증 목표:
- `User`와 `AuthIdentity` 연결
- `AuthProvider.GOOGLE`
- refresh token 저장과 조회

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthDomainPersistenceTest`
Expected: auth 모델과 migration이 없어 FAIL

- [ ] **Step 3: 엔티티와 migration을 구현한다**

모델 기준:
- `User`: id, displayName, email, createdAt, updatedAt
- `AuthIdentity`: provider, providerUserId, email, linkedUser
- `RefreshToken`: user, tokenHash(or token), expiresAt, revoked 여부
- `AuthProvider`: `GOOGLE`

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthDomainPersistenceTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 구글 인증 데이터 모델 추가"
```

### Task 3: Google login, refresh, logout API를 구현한다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/google/GoogleTokenVerifier.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtProperties.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/CurrentUser.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/GoogleAuthService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/TokenRefreshService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/AuthController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/GoogleLoginRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/RefreshTokenRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/LogoutRequest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/GoogleAuthControllerIntegrationTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/TokenRefreshServiceTest.java`

- [ ] **Step 1: 실패하는 인증 통합 테스트를 작성한다**

시나리오:
- Google login request로 세션 발급
- 첫 로그인 시 사용자 자동 생성
- refresh token으로 세션 갱신
- logout 시 refresh token 무효화
- 인증된 요청에서 현재 사용자 식별 가능

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.GoogleAuthControllerIntegrationTest --tests com.mybaseballrecord.auth.TokenRefreshServiceTest`
Expected: controller/service가 없어 FAIL

- [ ] **Step 3: 인증 흐름을 최소 구현한다**

구현 내용:
- Google token verifier abstraction
- app JWT issuance
- refresh rotation
- logout invalidation
- current user extraction

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.GoogleAuthControllerIntegrationTest --tests com.mybaseballrecord.auth.TokenRefreshServiceTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 구글 로그인 세션 흐름 구현"
```

## Chunk 3: Atomic Game Save

### Task 4: 경기 원자적 저장 API를 구현한다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/Game.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/GameType.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/BatterRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/PitcherRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/GameRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/BatterRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/PitcherRecordRepository.java`
- Create: `backend/src/main/resources/db/migration/V2__create_game_tables.sql`
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameSaveService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/GameController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/SaveGameRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/GameInfoRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/BatterRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/PitcherRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/SaveGameResponse.java`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameSaveServiceTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 저장 테스트를 작성한다**

커버 시나리오:
- batter만 저장
- pitcher만 저장
- 둘 다 저장
- 둘 다 비어 있으면 실패
- validation error 응답 포함

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameSaveServiceTest --tests com.mybaseballrecord.game.GameControllerIntegrationTest`
Expected: game save 구현이 없어 FAIL

- [ ] **Step 3: 최소 저장 구현을 만든다**

반영 내용:
- `POST /api/games`
- season resolver
- batter/pitcher optional save
- transaction boundary
- validation error mapping

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameSaveServiceTest --tests com.mybaseballrecord.game.GameControllerIntegrationTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 경기 원자적 저장 API 추가"
```

## Chunk 4: Integrated Stats Query

### Task 5: batter/pitcher 통합 기록 계산기를 만든다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/BatterStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/PitcherStatsCalculator.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/BatterStatsCalculatorTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/PitcherStatsCalculatorTest.java`

- [ ] **Step 1: 실패하는 계산기 테스트를 작성한다**

검증 내용:
- summary 값 계산
- detail 값 계산
- 0 상태 계산
- innings display 계산

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.BatterStatsCalculatorTest --tests com.mybaseballrecord.stats.PitcherStatsCalculatorTest`
Expected: calculator가 없어 FAIL

- [ ] **Step 3: 최소 계산기를 구현한다**

API contract 기준:
- batter summary/detail
- pitcher summary/detail
- empty response support

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.BatterStatsCalculatorTest --tests com.mybaseballrecord.stats.PitcherStatsCalculatorTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 통합 기록 계산기 추가"
```

### Task 6: 통합 기록 조회 API를 구현한다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/application/stats/StatsQueryService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/StatsController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/StatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterSummaryResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterDetailResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherSummaryResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherDetailResponse.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/StatsControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 stats query 테스트를 작성한다**

시나리오:
- `current_season`
- `career`
- `season + seasonYear`
- `batter`
- `pitcher`
- `gameFilter`
- empty response shape

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.StatsControllerIntegrationTest`
Expected: stats query 구현이 없어 FAIL

- [ ] **Step 3: 최소 조회 구현을 만든다**

반영 내용:
- `GET /api/stats`
- query validation
- user ownership filtering
- game type filtering
- response mapping

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.StatsControllerIntegrationTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 통합 기록 조회 API 추가"
```

## Chunk 5: Error Contract

### Task 7: 공통 에러 응답과 validation mapping을 구현한다

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/ApiErrorResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/FieldErrorItem.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/GlobalExceptionHandler.java`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/GoogleAuthControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 field error 테스트를 추가한다**

검증 내용:
- `fieldErrors[].field`
- `fieldErrors[].message`
- `retryable`
- `code`

- [ ] **Step 2: 테스트를 실행해 실패를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameControllerIntegrationTest --tests com.mybaseballrecord.auth.GoogleAuthControllerIntegrationTest`
Expected: error envelope contract mismatch로 FAIL

- [ ] **Step 3: 공통 에러 매핑을 구현한다**

반영 내용:
- validation exception mapping
- auth exception mapping
- generic exception mapping

- [ ] **Step 4: 테스트를 다시 실행해 통과를 확인한다**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameControllerIntegrationTest --tests com.mybaseballrecord.auth.GoogleAuthControllerIntegrationTest`
Expected: PASS

- [ ] **Step 5: 커밋한다**

```bash
git add backend/src/main backend/src/test
git commit -m "기능: 공통 API 오류 응답 추가"
```

## Rewrite Note

이 문서는 기존 `docs/superpowers/plans/2026-03-16-baseball-record-v1-backend.md`를 대체하기 위해 작성했다.
기존 문서는 아래 이유로 현재 기준과 맞지 않는다.

- 이메일/비밀번호 인증 전제
- recent games 포함
- 원자적 저장 API 미고정
- 새 API 계약 문서 미반영
