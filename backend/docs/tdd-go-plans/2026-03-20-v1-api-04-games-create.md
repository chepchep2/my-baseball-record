# V1 API 04 Games Create TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `POST /api/games` API를 v1 계약대로 구현해 경기 정보와 타자/투수 기록을 원자적으로 저장하고 개별 경기 상세 응답을 `201`으로 반환한다.

**Architecture:** `controller -> service -> domain -> repository` 수직 슬라이스로 구현한다. 생성 시 `playedAt`, `gameType`, `seasonYear` 결정 규칙을 서비스에서 고정한다.

**Tech Stack:** Spring Boot 3.5, Spring Security, Spring Data JPA, Validation, Flyway, JUnit 5, H2(test), PostgreSQL(local)

---

## 0) Why Games Create First

- game write API의 진입점
- update/delete는 create 데이터가 있어야 의미 있는 검증 가능
- 입력 검증 규칙을 먼저 고정하면 이후 API 재사용이 쉬움

## 1) Contract Target (`POST /api/games`)

### Request

`docs/superpowers/specs/2026-03-17-api-contract-v1.md`의 `POST /api/games` 요청 예시를 따른다.

### Success `201`

- create 성공 시 개별 경기 상세 응답 전체 반환

### Rules

- `seasonYear` 생략 가능
- `seasonYear` 생략 시 `playedAt` 연도를 기본값으로 저장
- `seasonYear` 전달 시 전달값 우선
- 생성은 원자적으로 처리(부분 저장 금지)

## 2) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/dto/game/request/GameCreateRequest.java`
- `src/main/java/com/chepchep2/mybaseballrecord/dto/game/response/GameDetailResponse.java`
- `src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameCommandController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/game/GameCommandService.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/game/*`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/game/*`
- `src/main/resources/db/migration/V2__create_game_tables.sql`

- `src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/repository/game/GameRepositoryTest.java`

### Modify

- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`

## 3) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameCreateControllerTest.java`

- [x] **Step 1: `POST /api/games` 성공 시 `201 + 상세 응답` 테스트 작성**
- [x] **Step 2: 필수 입력 검증 실패(`400 VALIDATION_ERROR`) 테스트 작성**
- [x] **Step 3: RED 확인**

Run: `./gradlew test --tests "*GameCreateControllerTest"`
Expected: 미구현으로 FAIL

- [x] **Step 4: 최소 구현으로 GREEN**
- [x] **Step 5: GREEN 확인**

### Task 2: Service 규칙 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/service/game/GameCreateServiceTest.java`

- [x] **Step 1: seasonYear 생략 시 playedAt 연도 사용 테스트 작성**
- [x] **Step 2: seasonYear 전달 시 전달값 저장 테스트 작성**
- [x] **Step 3: 원자적 저장(게임+하위 기록) 테스트 작성**
- [x] **Step 4: RED 확인**

Run: `./gradlew test --tests "*GameCreateServiceTest"`
Expected: 미구현으로 FAIL

- [x] **Step 5: 최소 구현으로 GREEN**
- [x] **Step 6: GREEN 확인**

### Task 3: Repository + Migration 테스트 (RED)

**Files:**
- Test: `src/test/java/com/chepchep2/mybaseballrecord/repository/game/GameRepositoryTest.java`
- Migration: `src/main/resources/db/migration/V2__create_game_tables.sql`

- [x] **Step 1: game/batter/pitcher 저장/조회 테스트 작성**
- [x] **Step 2: RED 확인**
- [x] **Step 3: 최소 구현으로 GREEN**
- [x] **Step 4: GREEN 확인**

### Task 4: APIdog 로컬 검증

- [ ] **Step 1: local 프로필 부팅**
- [ ] **Step 2: `POST /api/games` 성공(`201`) 확인**
- [ ] **Step 3: 잘못된 입력 실패(`400 VALIDATION_ERROR`) 확인**

APIdog 기본 설정:
- Method: `POST`
- URL: `http://localhost:8080/api/games`
- Header:
  - Name: `Content-Type`
  - Value: `application/json`
- Header:
  - Name: `Authorization`
  - Value: `Bearer {{access_token}}`

주의:
- 현재 단계에서 Security 설정이 `permitAll`이면 Authorization 없이도 통과 가능하다.
- 수동 검증 기준은 Authorization 헤더 포함 요청으로 고정한다.

### Task 5: 통합 검증

- [x] `./gradlew test --tests "*Game*"`
- [x] `./gradlew cleanTest test`

## 4) Small PR Boundary

- 포함:
  - `POST /api/games` 단일 API
  - game create 관련 domain/repository/migration
  - create 계약 검증 테스트
- 제외:
  - `PUT /api/games/{id}`
  - `DELETE /api/games/{id}`
  - stats/query API

## 5) Done Criteria

- `POST /api/games`가 계약대로 `201 + 상세 응답` 반환
- seasonYear 결정 규칙이 테스트로 고정
- 입력 검증 실패가 공통 envelope로 일치
- APIdog 수동 검증 완료
- 전체 테스트 통과
