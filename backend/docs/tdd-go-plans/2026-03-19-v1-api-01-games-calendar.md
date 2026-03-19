# V1 API 01 Games Calendar TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `GET /api/games/calendar` API를 v1 계약대로 구현해 월간 날짜별 경기 수를 조회할 수 있게 한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스를 최소 범위로 만든다. 이번 PR은 `calendar 조회`에 필요한 읽기 모델과 쿼리만 포함하고, 생성/수정/삭제 및 stats 계산은 제외한다. 에러 응답은 공통 envelope 형식으로 고정한다.

**Tech Stack:** Spring Boot 3.5, Spring MVC, Spring Data JPA, Validation, H2(test), JUnit 5

---

## 0) Backend Status Snapshot (2026-03-19)

- 코드 상태: 스프링 부트 기본 앱만 존재, 도메인/API 미구현
- 테스트 상태: `./gradlew test` 통과 (기본 컨텍스트 테스트만 존재)
- 워크트리 상태: 프론트엔드 변경사항은 있으나, 본 작업은 `backend`만 대상
- v1 계약 기준 문서: `docs/superpowers/specs/2026-03-17-api-contract-v1.md`

## 1) First API Candidate (v1 기준)

### 후보

1. `POST /api/auth/google`
2. `GET /api/games/calendar`
3. `GET /api/games?date=...`

### 선택

- **첫 API: `GET /api/games/calendar`**

### 선택 이유

- 외부 Google 검증 의존성 없이 백엔드 내부 수직 슬라이스를 빠르게 완성 가능
- `경기 관리` 핵심 시나리오(날짜별 조회/삭제 후 수치 갱신)의 시작점
- 집계 쿼리 + 입력 검증 + 에러 envelope를 작은 PR로 고정하기 좋음
- 이후 `GET /api/games?date=...`, `GET /api/games/{id}`, `DELETE /api/games/{id}`로 자연스럽게 확장 가능

## 2) Contract Target

- Endpoint: `GET /api/games/calendar?year=2026&month=3`
- Success `200`:

```json
{
  "year": 2026,
  "month": 3,
  "counts": [
    { "date": "2026-03-12", "count": 1 },
    { "date": "2026-03-18", "count": 2 }
  ]
}
```

- Validation/Error:
  - `year` 누락/형식 오류
  - `month` 누락/범위 오류(1~12)
  - 공통 error envelope 유지

## 3) File Structure

### Create

- `src/main/java/com/mybaseballrecord/domain/game/Game.java`
- `src/main/java/com/mybaseballrecord/domain/game/GameType.java`
- `src/main/java/com/mybaseballrecord/repository/game/GameRepository.java`
- `src/main/java/com/mybaseballrecord/repository/game/CalendarCountProjection.java`
- `src/main/java/com/mybaseballrecord/service/game/GameCalendarQueryService.java`
- `src/main/java/com/mybaseballrecord/web/game/GameCalendarController.java`
- `src/main/java/com/mybaseballrecord/web/game/dto/GameCalendarResponse.java`
- `src/main/java/com/mybaseballrecord/common/error/ApiErrorResponse.java`
- `src/main/java/com/mybaseballrecord/common/error/GlobalExceptionHandler.java`

- `src/test/java/com/mybaseballrecord/web/game/GameCalendarControllerTest.java`
- `src/test/java/com/mybaseballrecord/service/game/GameCalendarQueryServiceTest.java`
- `src/test/java/com/mybaseballrecord/repository/game/GameRepositoryTest.java`

### Modify

- `src/test/resources/application-test.yml` (필요 시 JPA ddl-auto 전략 조정)

## 4) TDD Go Tasks

### Task 1: Controller 계약 테스트 (RED)

**Files:**
- Test: `src/test/java/com/mybaseballrecord/web/game/GameCalendarControllerTest.java`

- [ ] **Step 1: 성공 응답 shape 실패 테스트 작성**

```java
@WebMvcTest(GameCalendarController.class)
class GameCalendarControllerTest {
  // GET /api/games/calendar?year=2026&month=3 -> 200, year/month/counts
}
```

- [ ] **Step 2: 검증 실패 테스트 작성 (`month=13`, 누락 파라미터)**
- [ ] **Step 3: RED 확인**

Run: `./gradlew test --tests "*GameCalendarControllerTest"`
Expected: `GameCalendarController` 또는 핸들러 미구현으로 FAIL

- [ ] **Step 4: 최소 구현으로 GREEN**
- [ ] **Step 5: GREEN 확인**

Run: `./gradlew test --tests "*GameCalendarControllerTest"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/.../game/web src/main/java/.../common/error src/test/java/.../game/web
git commit -m "test: add calendar controller contract tests and minimal endpoint"
```

### Task 2: Service 규칙 테스트 (RED)

**Files:**
- Test: `src/test/java/com/mybaseballrecord/service/game/GameCalendarQueryServiceTest.java`
- Modify: `src/main/java/com/mybaseballrecord/service/game/GameCalendarQueryService.java`

- [ ] **Step 1: year/month 입력으로 월 범위 조회를 위임하는 테스트 작성**
- [ ] **Step 2: 빈 결과 시 `counts=[]` 반환 테스트 작성**
- [ ] **Step 3: RED 확인**

Run: `./gradlew test --tests "*GameCalendarQueryServiceTest"`
Expected: 서비스/DTO 미구현으로 FAIL

- [ ] **Step 4: 최소 구현으로 GREEN**
- [ ] **Step 5: GREEN 확인**

Run: `./gradlew test --tests "*GameCalendarQueryServiceTest"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/main/java/.../game/service src/main/java/.../game/web/dto src/test/java/.../game/service
git commit -m "test: add calendar query service tests and implementation"
```

### Task 3: Repository 집계 테스트 (RED)

**Files:**
- Create/Modify: `src/main/java/com/mybaseballrecord/domain/game/Game.java`
- Create/Modify: `src/main/java/com/mybaseballrecord/repository/game/GameRepository.java`
- Test: `src/test/java/com/mybaseballrecord/repository/game/GameRepositoryTest.java`

- [ ] **Step 1: 같은 월 날짜별 count 집계 테스트 작성**
- [ ] **Step 2: 다른 월 데이터 제외 테스트 작성**
- [ ] **Step 3: 정렬 규칙(날짜 오름차순) 테스트 작성**
- [ ] **Step 4: RED 확인**

Run: `./gradlew test --tests "*GameRepositoryTest"`
Expected: 엔티티/쿼리 미구현으로 FAIL

- [ ] **Step 5: 최소 엔티티/JPQL(or native) 구현으로 GREEN**
- [ ] **Step 6: GREEN 확인**

Run: `./gradlew test --tests "*GameRepositoryTest"`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/main/java/.../game/domain src/main/java/.../game/repository src/test/java/.../game/repository
git commit -m "test: add calendar aggregation repository tests and query"
```

### Task 4: 통합 검증 및 정리

**Files:**
- Modify: 전체 변경 파일

- [ ] **Step 1: API 단위 테스트 묶음 실행**

Run: `./gradlew test --tests "*GameCalendar*"`
Expected: PASS

- [ ] **Step 2: 전체 테스트 실행**

Run: `./gradlew test`
Expected: PASS

- [ ] **Step 3: 불필요 코드 제거/네이밍 정리 (동작 변화 금지)**
- [ ] **Step 4: 최종 Commit**

```bash
git add src/main src/test
git commit -m "feat: implement v1 games calendar api with tdd"
```

## 5) PR Boundary (Small PR)

- 포함:
  - `GET /api/games/calendar` 계약 구현
  - 해당 API에 필요한 최소 엔티티/쿼리/서비스/에러 매핑
  - 검증/집계/응답 shape 테스트
- 제외:
  - 인증 플로우 전체
  - 게임 생성/수정/삭제
  - stats 계산 API
  - 프론트엔드 변경

## 6) Done Criteria

- API 계약 문서의 calendar 응답 shape와 일치
- month/year 검증 실패 시 공통 에러 envelope 반환
- 날짜별 count 집계와 정렬 규칙이 테스트로 고정
- `./gradlew test` 통과
- 변경 범위가 단일 API PR 크기를 유지
