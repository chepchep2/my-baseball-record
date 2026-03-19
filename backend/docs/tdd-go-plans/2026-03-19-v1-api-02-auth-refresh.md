# V1 API 02 Auth Refresh TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/auth/refresh` API를 v1 계약대로 구현해 유효한 refresh token으로 앱 세션(access/refresh token)을 재발급한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현한다. refresh token의 유효성/만료/폐기 상태를 서비스에서 판별하고, 성공 시 토큰 회전(rotation) 규칙을 적용한다.

**Tech Stack:** Spring Boot 3.5, Spring Security, Spring Data JPA, Validation, JWT(jjwt), JUnit 5, H2(test), PostgreSQL(local)

---

## 0) Why Refresh Next

- Google 로그인 다음으로 세션 유지의 핵심 API
- access token 만료 후 재로그인 없이 사용을 이어가는 최소 기능
- 이후 logout 구현의 선행 조건(토큰 상태 관리 규칙 공유)

## 1) Contract Target (`POST /api/auth/refresh`)

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### Success `200`

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "accessTokenExpiresAt": "2026-03-18T11:00:00Z",
  "refreshTokenExpiresAt": "2026-04-17T11:00:00Z",
  "user": {
    "id": 1,
    "displayName": "조상우",
    "email": "user@gmail.com",
    "provider": "GOOGLE"
  }
}
```

### Error

- `401 REFRESH_TOKEN_INVALID`
- `401 REFRESH_TOKEN_EXPIRED`
- `401 REFRESH_TOKEN_REVOKED`
- 공통 error envelope 유지

## 2) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthRefreshRequest.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/RefreshTokenValidator.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/auth/RefreshTokenInvalidException.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/auth/RefreshTokenExpiredException.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/auth/RefreshTokenRevokedException.java`

- `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java`

### Modify

- `src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
- 필요 시 `src/main/java/com/chepchep2/mybaseballrecord/domain/auth/RefreshToken.java`

## 3) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java`

- [x] **Step 1: 성공 응답 shape 테스트 작성**
- [x] **Step 2: `refreshToken` 누락/공백 검증 실패 테스트 작성**
- [x] **Step 3: INVALID/EXPIRED/REVOKED 예외 코드 매핑 테스트 작성**
- [x] **Step 4: RED 확인**

Run: `./gradlew test --tests "*AuthRefreshControllerTest"`
Expected: refresh endpoint 미구현으로 FAIL

- [x] **Step 5: 최소 구현으로 GREEN**
- [x] **Step 6: GREEN 확인**

Run: `./gradlew test --tests "*AuthRefreshControllerTest"`
Expected: PASS

### Task 2: Service 규칙 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java`

- [x] **Step 1: 유효 refresh token이면 access/refresh 재발급 테스트 작성**
- [x] **Step 2: 회전 규칙(기존 refresh 무효화 + 신규 refresh 저장) 테스트 작성**
- [x] **Step 3: invalid/expired/revoked 분기 테스트 작성**
- [x] **Step 4: RED 확인**

Run: `./gradlew test --tests "*AuthRefreshServiceTest"`
Expected: 서비스 규칙 미구현으로 FAIL

- [x] **Step 5: 최소 구현으로 GREEN**
- [x] **Step 6: GREEN 확인**

Run: `./gradlew test --tests "*AuthRefreshServiceTest"`
Expected: PASS

### Task 3: Repository 연계 테스트 보강

**Files:**
- Modify: `src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java`
- Modify: `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`

- [x] **Step 1: refresh token 조회/갱신/폐기 시나리오 테스트 추가**
- [x] **Step 2: RED 확인**

Run: `./gradlew test --tests "*AuthRepositoryTest"`
Expected: repository method 미구현으로 FAIL

- [x] **Step 3: 최소 구현으로 GREEN**
- [x] **Step 4: GREEN 확인**

Run: `./gradlew test --tests "*AuthRepositoryTest"`
Expected: PASS

### Task 4: 로컬 계약 검증

- [ ] **Step 1: local 프로필 실행 후 APIdog 성공 케이스 확인**
- [ ] **Step 2: 만료/무효/폐기 토큰 실패 응답 코드 확인**

APIdog 기본 설정:
- Method: `POST`
- URL: `http://localhost:8080/api/auth/refresh`
- Header:
  - Name: `Content-Type`
  - Value: `application/json`
- Body(JSON):
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

권장:
- 로그인 요청(`POST /api/auth/google`) PostProcessors에서
  - `access_token = response.body.accessToken`
  - `refresh_token = response.body.refreshToken`
  저장 후 refresh 검증에 사용
- refresh 성공 후에는 `refresh_token` 값을 새 토큰으로 다시 저장(토큰 회전 반영)

Run: `SPRING_PROFILES_ACTIVE=local ./gradlew bootRun`
Expected: 계약 코드와 실제 응답 일치

### Task 5: 통합 검증

- [x] **Step 1: auth 테스트 묶음 실행**

Run: `./gradlew test --tests "*Auth*"`
Expected: PASS

- [x] **Step 2: 전체 테스트 실행**

Run: `./gradlew cleanTest test`
Expected: PASS

## 4) Small PR Boundary

- 포함:
  - `POST /api/auth/refresh` 단일 API
  - refresh token 유효성 판별 + 회전 규칙
  - 에러 코드(`INVALID/EXPIRED/REVOKED`) 매핑
- 제외:
  - `POST /api/auth/logout`
  - game/stats API 전체

## 5) Done Criteria

- API 계약 request/response shape 일치
- `REFRESH_TOKEN_INVALID/EXPIRED/REVOKED` 코드 매핑 일치
- refresh token 회전 규칙이 테스트로 고정
- local 프로필에서 APIdog 실검증 완료
- `./gradlew cleanTest test` 통과
