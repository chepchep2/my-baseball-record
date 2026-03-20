# V1 API 08 Game Detail TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `GET /api/games/{gameId}` API를 v1 계약대로 구현해 개별 경기 상세(경기 정보 + 타자 + 투수)를 반환한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현한다. create/update 응답 DTO(`GameDetailResponse`)를 detail query에도 재사용한다.

**Tech Stack:** Spring Boot 3.5, Spring Data JPA, JUnit 5, Mockito, PostgreSQL(local)

---

## 1) Contract Target (`GET /api/games/{gameId}`)

### Success `200`

- 개별 경기 상세 응답 전체 반환
- batter/pitcher는 존재하지 않으면 `null` 허용

### Error

- 존재하지 않는 `gameId`면 `404 GAME_NOT_FOUND`

## 2) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/controller/game/GameQueryController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/game/GameQueryService.java`

- `src/test/java/com/chepchep2/mybaseballrecord/controller/game/GameDetailControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/game/GameDetailServiceTest.java`

### Modify

- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`

## 3) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

- [x] `GET /api/games/{id}` 성공 시 `200 + GameDetailResponse` 테스트 작성
- [x] 존재하지 않는 id 시 `404 GAME_NOT_FOUND` 테스트 작성
- [x] RED 확인

Run: `./gradlew test --tests "*GameDetailControllerTest"`

- [x] 최소 구현으로 GREEN
- [x] GREEN 확인

### Task 2: Service 조회 규칙 테스트 (RED)

- [x] game + batter + pitcher 조회 매핑 테스트 작성
- [x] batter/pitcher 부재 시 null 매핑 테스트 작성
- [x] 없는 gameId 시 `GameNotFoundException` 테스트 작성
- [x] RED 확인

Run: `./gradlew test --tests "*GameDetailServiceTest"`

- [x] 최소 구현으로 GREEN
- [x] GREEN 확인

### Task 3: 통합 검증

- [x] `./gradlew test --tests "*Game*Detail*"`
- [x] `./gradlew cleanTest test`

### Task 4: APIdog 수동 검증

- [ ] `GET /api/games/{id}` 성공(`200`) 확인
- [ ] 존재하지 않는 id 조회(`404 GAME_NOT_FOUND`) 확인

## 4) Small PR Boundary

- 포함:
  - `GET /api/games/{id}` 단일 API
  - detail query controller/service/tests
- 제외:
  - calendar/list query API
  - game create/update/delete 변경

## 5) Done Criteria

- `GET /api/games/{id}`가 계약 응답 shape로 반환
- `404 GAME_NOT_FOUND`가 테스트로 고정
- APIdog 수동 검증 가능 가이드 제공
