# V1 API 03 Auth Logout TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/auth/logout` API를 v1 계약대로 구현해 현재 refresh token을 무효화한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현한다. logout은 refresh token 삭제(또는 폐기 처리)로 세션 재발급 경로를 차단한다.

**Tech Stack:** Spring Boot 3.5, Spring Security, Spring Data JPA, Validation, JUnit 5, H2(test), PostgreSQL(local)

---

## 0) Why Logout Last In Auth

- login/refresh가 먼저 완성돼야 logout의 효과(재사용 차단)를 검증 가능
- refresh token 수명주기(발급 -> 회전 -> 무효화)의 마지막 단계
- auth chunk 마감 기준 API

## 1) Contract Target (`POST /api/auth/logout`)

### Request

```json
{
  "refreshToken": "refresh-token"
}
```

### Success `204`

- 응답 바디 없음

### Error

- 기본 구현에서는 `idempotent logout` 적용
- 존재하지 않는 refresh token이어도 `204` 반환
- 형식/입력 검증 실패만 `400 VALIDATION_ERROR`

## 2) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/AuthLogoutRequest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java`

### Modify

- `src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- 필요 시 `src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java`

## 3) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java`

- [x] **Step 1: 정상 요청 시 204 테스트 작성**
- [x] **Step 2: `refreshToken` 공백/누락 시 400 VALIDATION_ERROR 테스트 작성**
- [x] **Step 3: RED 확인**

Run: `./gradlew test --tests "*AuthLogoutControllerTest"`
Expected: logout endpoint 미구현으로 FAIL

- [x] **Step 4: 최소 구현으로 GREEN**
- [x] **Step 5: GREEN 확인**

Run: `./gradlew test --tests "*AuthLogoutControllerTest"`
Expected: PASS

### Task 2: Service 규칙 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java`

- [x] **Step 1: refresh token 존재 시 삭제 호출 테스트 작성**
- [x] **Step 2: refresh token 미존재 시에도 예외 없이 종료(idempotent) 테스트 작성**
- [x] **Step 3: RED 확인**

Run: `./gradlew test --tests "*AuthLogoutServiceTest"`
Expected: 서비스 메서드 미구현으로 FAIL

- [x] **Step 4: 최소 구현으로 GREEN**
- [x] **Step 5: GREEN 확인**

Run: `./gradlew test --tests "*AuthLogoutServiceTest"`
Expected: PASS

### Task 3: Repository 연계 보강

**Files:**
- Modify: `src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java`
- 필요 시 Test: `src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java`

- [x] **Step 1: token 기준 삭제 메서드 추가**
- [x] **Step 2: repository 테스트 보강(삭제 후 조회 없음)**
- [x] **Step 3: RED/GREEN 확인**

Run: `./gradlew test --tests "*AuthRepositoryTest"`
Expected: PASS

### Task 4: 로컬 계약 검증(APIdog)

- [ ] **Step 1: `POST /api/auth/google` 성공 후 `refresh_token` 확보**
- [ ] **Step 2: `POST /api/auth/logout` 호출해서 `204` 확인**
- [ ] **Step 3: 같은 refresh token으로 `POST /api/auth/refresh` 호출 시 `401 REFRESH_TOKEN_REVOKED` 확인**

APIdog 기본 설정:
- Method: `POST`
- URL: `http://localhost:8080/api/auth/logout`
- Header:
  - Name: `Content-Type`
  - Value: `application/json`
- Body(JSON):
```json
{
  "refreshToken": "{{refresh_token}}"
}
```

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
  - `POST /api/auth/logout` 단일 API
  - refresh token 무효화
  - refresh 재사용 차단 확인
- 제외:
  - game/stats API 전체

## 5) Done Criteria

- API 계약 request/response(204 no body) 일치
- logout 후 refresh 재사용 불가가 테스트/수동검증으로 확인
- local 프로필에서 APIdog 검증 완료
- `./gradlew cleanTest test` 통과
