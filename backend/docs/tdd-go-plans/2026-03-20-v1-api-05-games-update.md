# V1 API 05 Games Update TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `PUT /api/games/{gameId}` API를 v1 계약대로 구현해 경기 기록을 수정하고 개별 경기 상세 응답을 반환한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현한다. 수정 불가 필드(`playedAt`, `gameType`, `seasonYear`) 규칙을 서비스에서 강제한다.

---

## 1) Contract Target (`PUT /api/games/{gameId}`)

- 성공: `200` + 개별 경기 상세 응답
- 불변 규칙:
  - `playedAt` 수정 불가
  - `gameType` 수정 불가
  - `seasonYear` 수정 불가

## 2) TDD Go Tasks

### Task 1: Controller RED

- [ ] `PUT /api/games/{id}` 성공 `200` 테스트 작성
- [ ] validation 실패 `400 VALIDATION_ERROR` 테스트 작성
- [ ] RED 확인
- [ ] 최소 구현으로 GREEN

### Task 2: Service RED

- [ ] 불변 필드 변경 시 실패 테스트 작성
- [ ] 변경 가능 필드 업데이트 성공 테스트 작성
- [ ] batter/pitcher 동시 수정 테스트 작성
- [ ] RED -> GREEN

### Task 3: Repository/Migration 점검

- [ ] update 시나리오 repository 테스트 보강
- [ ] 업데이트 후 조회값 반영 확인

### Task 4: APIdog 검증

- Method: `PUT`
- URL: `http://localhost:8080/api/games/{gameId}`
- Header:
  - `Content-Type: application/json`
  - 필요 시 `Authorization: Bearer {{access_token}}`
- 성공 케이스: 변경 가능 필드 수정 -> `200`
- 실패 케이스: `playedAt`/`gameType`/`seasonYear` 변경 시도 -> 에러 확인

### Task 5: 통합 검증

- [ ] `./gradlew test --tests "*Game*Update*"`
- [ ] `./gradlew cleanTest test`

## 3) Done Criteria

- 불변 필드 규칙이 테스트로 고정
- 성공/실패 응답이 계약과 일치
- APIdog 수동 검증 완료
- 전체 테스트 통과
