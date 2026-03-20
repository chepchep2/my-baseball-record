# V1 API 07 Stats Query TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `GET /api/stats` API를 v1 계약대로 구현해 `scope`, `recordType`, `gameFilter` 기준 누적 기록을 반환한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현하고, 계산 로직은 `service.stats`에 모은다.

**Tech Stack:** Spring Boot 3.5, Spring Data JPA, Validation, JUnit 5, Mockito, PostgreSQL(local)

---

## 1) Contract Target (`GET /api/stats`)

### Query Parameters

- `scope`: `current_season | career | season`
- `seasonYear`: `scope=season`일 때 필수
- `recordType`: `batter | pitcher`
- `gameFilter`: `all | league | non_official`

### Success `200`

- `recordType=batter`면 batter summary/details 응답
- `recordType=pitcher`면 pitcher summary/details 응답
- 데이터가 없으면 `isEmpty=true`와 0 기반 집계 반환

### Validation

- `scope=season`인데 `seasonYear` 누락 시 `400 VALIDATION_ERROR`

## 2) File Structure

### Create

- `src/main/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryController.java`
- `src/main/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryService.java`
- `src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/BatterStatsResponse.java`
- `src/main/java/com/chepchep2/mybaseballrecord/dto/stats/response/PitcherStatsResponse.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/stats/StatsScope.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/stats/StatsRecordType.java`
- `src/main/java/com/chepchep2/mybaseballrecord/domain/stats/StatsGameFilter.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/stats/InvalidStatsQueryException.java`

- `src/test/java/com/chepchep2/mybaseballrecord/controller/stats/StatsQueryControllerTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/service/stats/StatsQueryServiceTest.java`

### Modify

- `src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/game/BatterRecordRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/repository/game/PitcherRecordRepository.java`
- `src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java`

## 3) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

- [x] `GET /api/stats` batter 조회 시 `200 + 계약 응답` 테스트 작성
- [x] `scope=season` + `seasonYear` 누락 시 `400 VALIDATION_ERROR` 테스트 작성
- [x] RED 확인

Run: `./gradlew test --tests "*StatsQueryControllerTest"`

- [x] 최소 구현으로 GREEN
- [x] GREEN 확인

### Task 2: Service 계산 테스트 (RED)

- [x] batter 집계(AVG/OPS 포함) 테스트 작성
- [x] pitcher 집계(ERA/WHIP/K9 포함) 테스트 작성
- [x] gameFilter 반영 테스트 작성
- [x] RED 확인

Run: `./gradlew test --tests "*StatsQueryServiceTest"`

- [x] 최소 구현으로 GREEN
- [x] GREEN 확인

### Task 3: 통합 검증

- [x] `./gradlew test --tests "*Stats*"`
- [x] `./gradlew cleanTest test`

### Task 4: APIdog 수동 검증

- [ ] `GET /api/stats?scope=current_season&recordType=batter&gameFilter=all` 확인
- [ ] `GET /api/stats?scope=season&recordType=batter&gameFilter=all` (`seasonYear` 누락) 에러 확인
- [ ] `GET /api/stats?scope=career&recordType=pitcher&gameFilter=league` 확인

## 4) Small PR Boundary

- 포함:
  - `GET /api/stats` 단일 API
  - stats 계산/검증/응답 DTO
  - stats controller/service 테스트
- 제외:
  - game calendar/list/detail query
  - 인증/인가 구조 고도화

## 5) Done Criteria

- `GET /api/stats`가 계약 shape로 응답
- `scope=season` 검증 규칙이 테스트로 고정
- batter/pitcher 계산 결과가 테스트로 고정
- APIdog 수동 검증 시나리오가 리뷰 가이드에 반영
