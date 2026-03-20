# V1 API 06 Games Delete TDD Go Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `DELETE /api/games/{gameId}` API를 v1 계약대로 구현해 경기 기록을 삭제하고 `204 No Content`를 반환한다.

**Architecture:** `controller -> service -> repository` 수직 슬라이스로 구현한다. 삭제 시 game과 하위 batter/pitcher 레코드 정합성을 함께 보장한다.

---

## 1) Contract Target (`DELETE /api/games/{gameId}`)

- 성공: `204 No Content`
- 기본 정책:
  - 존재하지 않는 gameId는 `404` 또는 `204` 중 정책 선택 후 고정
  - 본 계획에서는 `404 GAME_NOT_FOUND` 정책으로 진행 권장

## 2) TDD Go Tasks

### Task 1: Controller RED

- [ ] `DELETE /api/games/{id}` 성공 `204` 테스트 작성
- [ ] 미존재 id 삭제 시 에러 테스트 작성
- [ ] RED 확인
- [ ] 최소 구현으로 GREEN

### Task 2: Service RED

- [ ] 존재 id 삭제 시 repository delete 호출 테스트
- [ ] 미존재 id 예외(`GAME_NOT_FOUND`) 테스트
- [ ] 삭제 후 조회 불가 테스트(가능 시 repository 포함)
- [ ] RED -> GREEN

### Task 3: Repository/Migration 점검

- [ ] FK/ON DELETE CASCADE 정책 검증
- [ ] game 삭제 시 하위 record 정리 확인

### Task 4: APIdog 검증

- Method: `DELETE`
- URL: `http://localhost:8080/api/games/{gameId}`
- Headers:
  - 필요 시 `Authorization: Bearer {{access_token}}`
- 성공: `204`, body 없음
- 실패: 미존재 id 정책 응답 확인

### Task 5: 통합 검증

- [ ] `./gradlew test --tests "*Game*Delete*"`
- [ ] `./gradlew cleanTest test`

## 3) Done Criteria

- 삭제 성공 시 `204` 고정
- 미존재 id 처리 정책이 테스트/코드/문서에 일치
- 하위 레코드 정합성이 보장
- APIdog 수동 검증 완료
- 전체 테스트 통과
