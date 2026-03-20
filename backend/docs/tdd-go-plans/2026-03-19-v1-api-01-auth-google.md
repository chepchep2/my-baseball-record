# V1 API 01 Auth Google TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/auth/google` API를 v1 계약대로 구현해 Google 로그인 성공 후 앱 세션(access/refresh token)을 발급한다.

**Architecture:** `controller -> service -> provider verifier -> repository` 수직 슬라이스로 구현한다. Google `idToken` 검증은 인터페이스로 분리해 테스트에서는 fake verifier를 사용하고, 런타임에서는 실제 verifier를 주입한다.

**Tech Stack:** Spring Boot 3.5, Spring Security, Spring Data JPA, Validation, JWT(jjwt), JUnit 5, H2(test), PostgreSQL(local)

---

## 0) Why Auth First

- v1 시나리오의 공통 진입점이 로그인
- 이후 모든 API의 사용자 소유권 분리에 선행 필요
- 계약 문서 기준으로 `POST /api/auth/google`이 세션 모델의 시작점

## 1) Local Test/Run Prerequisites

### 필수

- Java 21
- `backend` 기준 Gradle 실행 가능 환경
- PostgreSQL (로컬 실행용)
- JWT secret 환경변수
- Google token 검증 설정값 (client id 또는 JWKS 검증 설정)

### 권장

- **docker-compose로 PostgreSQL 실행**
  - 이유: 팀 공통 재현성, 로컬 DB 버전 편차 감소, 빠른 온보딩
  - 결론: `docker-compose.yml`은 만드는 것이 좋다.

### 현재 코드 기준 주의점

- `application.yml`이 PostgreSQL(`localhost:5432`)을 바라봄
- JPA `ddl-auto: validate`라서 스키마 없으면 앱 부팅 실패
- 따라서 로컬 실행 전 아래 중 하나 필요:
  1. Flyway migration 작성 + flyway enable
  2. dev 전용 ddl 전략(임시) 사용

## 2) Contract Target (`POST /api/auth/google`)

### Request

```json
{
  "idToken": "google-id-token"
}
```

### Success `200`

```json
{
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "accessTokenExpiresAt": "2026-03-18T10:00:00Z",
  "refreshTokenExpiresAt": "2026-04-17T10:00:00Z",
  "user": {
    "id": 1,
    "displayName": "조상우",
    "email": "user@gmail.com",
    "provider": "GOOGLE"
  }
}
```

### Error

- `400 INVALID_GOOGLE_TOKEN`
- `401 GOOGLE_AUTH_FAILED`
- 공통 error envelope 유지

## 3) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/GoogleLoginRequest.java`
- `src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/GoogleTokenVerifier.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/JwtTokenIssuer.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/auth/User.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/auth/RefreshToken.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/UserRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/ApiErrorResponse.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/CommonConfig.java`
- `src/main/resources/db/migration/V1__create_auth_tables.sql`
- `src/main/resources/application-local.properties`
- `docker-compose.yml`
- `.env.example`

- `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java`

### Modify

- `src/main/resources/application.properties` (profile include 및 환경변수 키 반영)
- `src/test/resources/application-test.properties` (테스트 스키마 전략 정리)

## 4) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java`

- [x] **Step 1: 성공 응답 shape 테스트 작성**
- [x] **Step 2: `idToken` 누락/공백 검증 실패 테스트 작성**
- [x] **Step 3: verifier 실패 시 에러 코드 매핑 테스트 작성**
- [x] **Step 4: RED 확인**

Run: `./gradlew test --tests "*AuthControllerTest"`
Expected: controller/dto 미구현으로 FAIL

- [x] **Step 5: 최소 구현으로 GREEN**
- [x] **Step 6: GREEN 확인**

Run: `./gradlew test --tests "*AuthControllerTest"`
Expected: PASS

### Task 2: Service 규칙 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java`

- [x] **Step 1: 신규 유저 생성 + 토큰 발급 테스트 작성**
- [x] **Step 2: 기존 유저 재로그인 + 토큰 재발급 테스트 작성**
- [x] **Step 3: refresh token 저장 테스트 작성**
- [x] **Step 4: RED 확인**

Run: `./gradlew test --tests "*AuthServiceTest"`
Expected: 서비스/리포지토리 미구현으로 FAIL

- [x] **Step 5: 최소 구현으로 GREEN**
- [x] **Step 6: GREEN 확인**

Run: `./gradlew test --tests "*AuthServiceTest"`
Expected: PASS

### Task 3: Repository + Migration 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java`
- Modify/Create: auth domain/repository, `V1__create_auth_tables.sql`

- [x] **Step 1: user upsert/조회 테스트 작성**
- [x] **Step 2: refresh token 저장 테스트 작성**
- [x] **Step 3: RED 확인**

Run: `./gradlew test --tests "*AuthRepositoryTest"`
Expected: 엔티티/스키마 미구현으로 FAIL

- [x] **Step 4: 최소 엔티티/리포지토리/마이그레이션 구현으로 GREEN**
- [x] **Step 5: GREEN 확인**

Run: `./gradlew test --tests "*AuthRepositoryTest"`
Expected: PASS

### Task 4: 로컬 실행 경로 고정

**Files:**
- `docker-compose.yml`
- `.env.example`
- `application-local.properties`

- [x] **Step 1: postgres docker-compose 작성 (`5432`, db/user/password 명시)**
- [x] **Step 2: 환경변수 템플릿 작성 (`JWT_SECRET`, 만료시간, GOOGLE_CLIENT_ID`)**
- [x] **Step 3: local profile로 앱 부팅 확인**

Run: `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun`
Expected: 앱 부팅 성공

### Task 5: 통합 검증

- [x] **Step 1: auth 테스트 묶음 실행**

Run: `./gradlew test --tests "*Auth*"`
Expected: PASS

- [x] **Step 2: 전체 테스트 실행**

Run: `./gradlew test`
Expected: PASS

## 5) Small PR Boundary

- 포함:
  - `POST /api/auth/google` 단일 API
  - 최소 인증 도메인(User/RefreshToken)
  - 로컬 테스트 실행 기반(Postgres compose + env template)
- 제외:
  - `POST /api/auth/refresh`
  - `POST /api/auth/logout`
  - game/stats API 전체

## 6) Done Criteria

- API 계약과 응답 shape 일치
- 에러 code/envelope 일치
- user/refresh token 저장이 테스트로 고정
- local profile에서 app 부팅 가능
- `./gradlew test` 통과
