# Baseball Record V1 Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 백엔드를 새로 구성해 이메일/비밀번호 + refresh token 기반 인증, 경기 생성, 타자/투수 경기 요약 입력, 시즌/통산 누적 계산, 통합 기록/최근 경기 조회 API를 제공한다.

**Architecture:** `backend/` 아래에 새 Spring Boot 애플리케이션을 만들고, `domain`, `application`, `infrastructure`, `presentation` 레이어를 최상위 기준으로 둔다. 각 레이어 안에서 `auth`, `game`, `stats` 하위 도메인을 나누고, 사용자 소유의 경기와 기록을 JPA로 저장한 뒤 저장된 경기 요약 기록을 바탕으로 시즌/통산 통계를 계산한다. 인증 도메인과 야구 기록 도메인을 분리해 이후 소셜 로그인 추가나 프론트 연결 시 구조가 흔들리지 않도록 한다.

**Tech Stack:** Java 21, Spring Boot, Spring Web, Spring Security, Spring Data JPA, Validation, PostgreSQL, Flyway, JUnit 5, Spring Boot Test, Testcontainers, AssertJ, JWT

---

## 전제 조건

- 현재 저장소에는 백엔드 코드가 없다. 이번 계획은 `backend/` 아래에 새 프로젝트를 만드는 전제로 작성한다.
- 프론트엔드는 이번 범위에서 제외한다. 이번 계획은 백엔드 API와 테스트 중심이다.
- 인증은 이메일/비밀번호 기반으로 시작하되, access token / refresh token 구조를 사용하고 나중에 소셜 로그인 추가가 가능하도록 계정 구조를 잡는다.
- `경기 유형`은 v1에서 `LEAGUE`, `NON_OFFICIAL`처럼 단순하게 저장한다.
- 최근 경기 응답은 가벼운 리스트 형태로 유지한다. 경기 상세 화면용 API는 후속 범위로 둔다.
- v1의 `Game`은 사용자 개인 소유 경기 기록으로 모델링한다. 이후 여러 사용자가 하나의 실제 경기에 연결되어야 하면 `Game`과 `PlayerGameRecord` 같은 참여 엔티티를 분리하는 방향으로 확장한다.
- 최근 경기 응답의 정보 밀도는 프론트 구현 단계에서 다시 검토한다.

## 파일 구조

### 프로젝트 및 빌드 파일

- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/gradle.properties`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/test/resources/application-test.yml`

### 애플리케이션 시작점

- Create: `backend/src/main/java/com/mybaseballrecord/BaseballRecordApplication.java`

### 공통 인프라

- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/config/JpaConfig.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtProperties.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/CurrentUser.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/ApiErrorResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/GlobalExceptionHandler.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/common/SeasonResolver.java`

### 인증 도메인

- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/User.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthIdentity.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/AuthProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/auth/RefreshToken.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/UserRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/AuthIdentityRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/RefreshTokenRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/AuthService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/TokenRefreshService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/AuthController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/SignUpRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/RefreshTokenRequest.java`

### 경기 및 기록 도메인

- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/Game.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/GameType.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/BatterRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/PitcherRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/GameRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/BatterRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/PitcherRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameCommandService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameQueryService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/GameController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/CreateGameRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/UpdateBatterRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/UpdatePitcherRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/GameResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/RecentGameItemResponse.java`

### 통계 도메인

- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/BatterStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/PitcherStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/stats/StatsAggregationService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/StatsController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterStatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherStatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/IntegratedStatsResponse.java`

### 데이터베이스 마이그레이션

- Create: `backend/src/main/resources/db/migration/V1__create_auth_tables.sql`
- Create: `backend/src/main/resources/db/migration/V2__create_game_tables.sql`

### 테스트

- Create: `backend/src/test/java/com/mybaseballrecord/auth/AuthControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/auth/TokenRefreshServiceTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/game/GameCommandServiceTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/BatterStatsCalculatorTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/PitcherStatsCalculatorTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/stats/StatsControllerIntegrationTest.java`
- Create: `backend/src/test/java/com/mybaseballrecord/support/PostgresContainerTest.java`

## Chunk 1: 프로젝트 시작 및 빌드 구성

### Task 1: 백엔드 프로젝트 뼈대 만들기

**Files:**
- Create: `backend/build.gradle`
- Create: `backend/settings.gradle`
- Create: `backend/gradle.properties`
- Create: `backend/src/main/java/com/mybaseballrecord/BaseballRecordApplication.java`
- Create: `backend/src/main/resources/application.yml`
- Create: `backend/src/test/resources/application-test.yml`

- [ ] **Step 1: 실패하는 부트스트랩 테스트 작성**

Create `backend/src/test/java/com/mybaseballrecord/BaseballRecordApplicationTest.java` with:

```java
@SpringBootTest
class BaseballRecordApplicationTest {
    @Test
    void contextLoads() {
    }
}
```

- [ ] **Step 2: 테스트를 실행해 실제로 실패하는지 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.BaseballRecordApplicationTest`
Expected: Gradle 프로젝트와 애플리케이션 클래스가 없어 FAIL

- [ ] **Step 3: Spring Boot 프로젝트 생성**

아래 의존성을 포함한다.
- `spring-boot-starter-web`
- `spring-boot-starter-security`
- `spring-boot-starter-data-jpa`
- `spring-boot-starter-validation`
- `flyway-core`
- `postgresql`
- `jjwt-api` 및 구현체
- `spring-boot-starter-test`
- `testcontainers-postgresql`

애플리케이션 시작 클래스와 기본 설정 파일도 함께 만든다.

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.BaseballRecordApplicationTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend
git commit -m "feat: bootstrap baseball record backend"
```

## Chunk 2: 인증 기반 구성

### Task 2: 사용자, 로그인 수단, refresh token 모델링

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

- [ ] **Step 1: 실패하는 영속성 테스트 작성**

`User`, `AuthIdentity`, `RefreshToken`을 저장한 뒤, 각 엔티티가 올바르게 연결되는지 검증하는 JPA 테스트를 작성한다.

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthDomainPersistenceTest`
Expected: auth 엔티티와 마이그레이션이 없어 FAIL

- [ ] **Step 3: 사용자 및 인증 엔티티 구현**

모델 기준:
- `User`: id, displayName, createdAt, updatedAt
- `AuthIdentity`: provider, email, passwordHash, linked `User`
- `RefreshToken`: user, token(or hashed token), expiresAt, revoked 여부
- `AuthProvider`: 현재는 `LOCAL`만 사용하고, 이후 소셜 provider 추가를 염두에 둔다

인증용 테이블과 인덱스를 생성하는 Flyway 마이그레이션도 함께 만든다.

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthDomainPersistenceTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: add auth identity data model"
```

### Task 3: 회원가입, 로그인, 로그아웃, 토큰 재발급 API 구현

**Files:**
- Modify: `backend/src/main/java/com/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtProperties.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtTokenProvider.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/JwtAuthenticationFilter.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/security/CurrentUser.java`
- Modify: `backend/src/main/java/com/mybaseballrecord/domain/auth/RefreshToken.java`
- Modify: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/auth/RefreshTokenRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/AuthService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/auth/TokenRefreshService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/AuthController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/SignUpRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/LoginRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/AuthTokenResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/auth/dto/RefreshTokenRequest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/AuthControllerIntegrationTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/auth/TokenRefreshServiceTest.java`

- [ ] **Step 1: 실패하는 인증 통합 테스트 작성**

아래 시나리오를 커버한다.
- 회원가입 시 local user 생성
- 로그인 시 access token과 refresh token 반환
- 인증된 요청에서 현재 사용자 식별 가능
- refresh token으로 access token 재발급 가능
- 로그아웃 시 refresh token 무효화

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthControllerIntegrationTest --tests com.mybaseballrecord.auth.TokenRefreshServiceTest`
Expected: 컨트롤러와 서비스가 없어 FAIL

- [ ] **Step 3: 인증 흐름 구현**

구현 범위:
- Spring Security 기반 password hashing
- access token / refresh token 기반 인증
- 회원가입/로그인/로그아웃 API
- refresh token DB 저장 및 재발급 API
- 로그아웃 시 refresh token 무효화

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.auth.AuthControllerIntegrationTest --tests com.mybaseballrecord.auth.TokenRefreshServiceTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: implement local authentication APIs"
```

## Chunk 3: 경기 및 기록 입력 API

### Task 4: 경기, 타자 기록, 투수 기록 데이터 모델 구현

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/Game.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/GameType.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/BatterRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/game/PitcherRecord.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/GameRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/BatterRecordRepository.java`
- Create: `backend/src/main/java/com/mybaseballrecord/infrastructure/persistence/game/PitcherRecordRepository.java`
- Create: `backend/src/main/resources/db/migration/V2__create_game_tables.sql`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameDomainPersistenceTest.java`

- [ ] **Step 1: 실패하는 영속성 테스트 작성**

한 사용자가 소유한 경기 하나에 타자 기록과 투수 기록을 모두 연결해 저장한 뒤, 관계가 올바르게 복원되는지 검증하는 JPA 테스트를 작성한다.

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameDomainPersistenceTest`
Expected: 경기 엔티티와 마이그레이션이 없어 FAIL

- [ ] **Step 3: 경기 및 기록 엔티티 구현**

모델 기준:
- `Game`은 한 명의 사용자 소유
- date, seasonYear, type, teamName, opponentName, note 저장
- `BatterRecord`는 선택 입력
- `PitcherRecord`도 선택 입력

중요한 모델링 포인트:
- 타자 기록은 singles, doubles, triples, homeRuns를 각각 저장
- totalHits는 저장하지 않고 계산값으로 만든다
- 투수 이닝은 내부적으로 `outsRecorded` 정수로 관리한다
- 다만 입력 UX는 `정수 이닝 + 추가 아웃 수(0/1/2)` 형태로 받고, 서비스 계층에서 `outsRecorded`로 변환한다

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameDomainPersistenceTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: add game and record data model"
```

### Task 5: 경기 생성 및 기록 입력 API 구현

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameCommandService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/GameController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/CreateGameRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/UpdateBatterRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/UpdatePitcherRecordRequest.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/GameResponse.java`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameCommandServiceTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 명령 테스트 작성**

아래 시나리오를 커버한다.
- 날짜만 입력하면 `seasonYear` 자동 계산
- 필요 시 `seasonYear` 수동 override 가능
- 경기 생성 후 타자 기록 추가 가능
- 경기 생성 후 투수 기록 추가 가능
- 한 경기에서 타자/투수 기록 동시 저장 가능
- 다른 사용자의 경기 수정 불가

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameCommandServiceTest --tests com.mybaseballrecord.game.GameControllerIntegrationTest`
Expected: 서비스와 API가 없어 FAIL

- [ ] **Step 3: 명령 서비스 및 REST API 구현**

엔드포인트:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/games`
- `PUT /api/games/{gameId}/batter-record`
- `PUT /api/games/{gameId}/pitcher-record`

검증 포인트:
- 카운팅 필드는 음수 불가
- `seasonYear`는 날짜 기준 자동 계산, 필요 시 override 허용
- 추가 항목은 optional 입력 허용
- 투수 입력의 `additionalOuts`는 `0`, `1`, `2`만 허용

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.game.GameCommandServiceTest --tests com.mybaseballrecord.game.GameControllerIntegrationTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: implement game and record command APIs"
```

## Chunk 4: 누적 계산 및 조회 API

### Task 6: 타자/투수 기록 계산기 구현

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/BatterStatsCalculator.java`
- Create: `backend/src/main/java/com/mybaseballrecord/domain/stats/PitcherStatsCalculator.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/BatterStatsCalculatorTest.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/PitcherStatsCalculatorTest.java`

- [ ] **Step 1: 실패하는 계산 테스트 작성**

아래 수식을 검증한다.
- 타자: total hits, batting average, OBP, SLG, OPS
- 투수: ERA, WHIP, batting average against, strikeouts per 9
- `outsRecorded`를 이닝으로 변환하는 규칙
- 0으로 나누는 경우의 예외 처리 방식

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.BatterStatsCalculatorTest --tests com.mybaseballrecord.stats.PitcherStatsCalculatorTest`
Expected: 계산기가 없어 FAIL

- [ ] **Step 3: 순수 계산 서비스 구현**

이 클래스들은 repository를 직접 조회하지 않는 순수 계산 로직으로 유지한다.

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.BatterStatsCalculatorTest --tests com.mybaseballrecord.stats.PitcherStatsCalculatorTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: add baseball stat calculators"
```

### Task 7: 통합 기록 및 최근 경기 조회 API 구현

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/application/game/GameQueryService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/application/stats/StatsAggregationService.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/StatsController.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/BatterStatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/PitcherStatsResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/stats/dto/IntegratedStatsResponse.java`
- Modify: `backend/src/main/java/com/mybaseballrecord/presentation/game/dto/RecentGameItemResponse.java`
- Test: `backend/src/test/java/com/mybaseballrecord/stats/StatsControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 조회 통합 테스트 작성**

아래 시나리오를 커버한다.
- 전체 경기 기준 시즌 요약
- `LEAGUE` 필터 기준 시즌 요약
- `NON_OFFICIAL` 필터 기준 시즌 요약
- 여러 시즌을 합친 통산 요약
- 최근 경기 목록이 날짜 역순으로 반환
- 응답이 현재 로그인 사용자 데이터만 포함

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.StatsControllerIntegrationTest`
Expected: 조회 서비스와 컨트롤러가 없어 FAIL

- [ ] **Step 3: 조회 및 집계 API 구현**

추천 엔드포인트:
- `GET /api/stats/integrated?mode=season&seasonYear=2026&recordType=batter&gameFilter=all`
- `GET /api/stats/integrated?mode=career&recordType=pitcher&gameFilter=non_official`
- `GET /api/games/recent?recordType=batter&seasonYear=2026&gameFilter=all&limit=10`

최근 경기 응답은 가볍게 유지한다.
- game id
- date
- opponent
- game type
- 짧은 타자/투수 기록 요약

- [ ] **Step 4: 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test --tests com.mybaseballrecord.stats.StatsControllerIntegrationTest`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: implement integrated stats queries"
```

## Chunk 5: 검증, 예외 처리, 테스트 기반 정리

### Task 8: 입력 검증, 예외 처리, 공통 테스트 지원 추가

**Files:**
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/ApiErrorResponse.java`
- Create: `backend/src/main/java/com/mybaseballrecord/presentation/common/GlobalExceptionHandler.java`
- Create: `backend/src/test/java/com/mybaseballrecord/support/PostgresContainerTest.java`
- Modify: `backend/src/test/java/com/mybaseballrecord/auth/AuthControllerIntegrationTest.java`
- Modify: `backend/src/test/java/com/mybaseballrecord/game/GameControllerIntegrationTest.java`
- Modify: `backend/src/test/java/com/mybaseballrecord/stats/StatsControllerIntegrationTest.java`

- [ ] **Step 1: 실패하는 검증 테스트 작성**

아래 케이스를 추가한다.
- 음수 스탯 입력
- 잘못된 이메일 형식으로 회원가입
- 인증 없이 접근
- 필수 필드 누락

- [ ] **Step 2: 테스트를 실행해 실패 확인**

Run: `cd backend && ./gradlew test`
Expected: 공통 예외 처리와 테스트 지원이 없어 FAIL

- [ ] **Step 3: 입력 검증과 에러 응답 표준화**

아래 응답을 일관되게 정리한다.
- 400 validation error
- 401/403 auth error
- 404 not found

또한 Testcontainers 기반 PostgreSQL 테스트 공통 기반 클래스를 만든다.

- [ ] **Step 4: 전체 테스트를 다시 실행해 통과 확인**

Run: `cd backend && ./gradlew test`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add backend/src/main backend/src/test
git commit -m "feat: harden backend validation and test support"
```

## 실행 시 참고 사항

- 프론트 UI 관련 선택지는 API 형태에 영향을 주는 경우만 고려한다.
- refresh token은 DB/JPA 기반 `RefreshToken` 엔티티와 `RefreshTokenRepository`로 관리한다.
- v1에서는 `NON_OFFICIAL`을 단일 타입으로 저장하므로, 세부 비공식 경기 구분이 필요해지면 후속 버전에서 타입 체계를 확장한다.
- 최근 경기 응답이 무거워지기 시작하면 리스트용 응답과 상세용 응답을 분리한다.

Plan complete and saved to `docs/superpowers/plans/2026-03-16-baseball-record-v1-backend.md`. Ready to execute?
