# Game Matchmaking v2 Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** v2 경기 생성 흐름을 위한 백엔드 첫 묶음으로 후보 조회, shared 경기 생성, shared 경기 상세 조회 API를 추가한다.

**Architecture:** 기존 `/api/games`는 유지하고, v2 전용 `/api/matches` 경로를 새로 추가한다. `game_record`를 shared 경기 컨테이너로 쓰고, `batter_record.user_id`를 기준으로 사용자별 기록을 읽는다. 구장 추천/직접 입력은 `stadium` 테이블로 처리한다.

**Tech Stack:** Spring Boot 3.5, Spring MVC, Spring Data JPA, Flyway, JUnit 5, Mockito

---

## Chunk 1: v2 API 골격과 저장소

### Task 1: v2 API 계약 테스트 추가

**Files:**
- Create: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/MatchQueryServiceTest.java`
- Create: `backend/src/test/java/com/chepchep2/mybaseballrecord/service/game/MatchCommandServiceTest.java`
- Create: `backend/src/test/java/com/chepchep2/mybaseballrecord/controller/game/MatchControllerTest.java`

- [ ] 후보 조회, shared 경기 생성, shared 경기 상세에 대한 failing test를 먼저 작성한다.
- [ ] `./gradlew test --tests 'com.chepchep2.mybaseballrecord.service.game.Match*' --tests 'com.chepchep2.mybaseballrecord.controller.game.MatchControllerTest'`로 실패를 확인한다.

### Task 2: 저장소와 엔티티 기반 추가

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/StadiumRepository.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/BatterRecordVerificationRepository.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/GameRecordRepository.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/game/BatterRecordRepository.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/UserRepository.java`

- [ ] 지역/시간 기준 후보 조회용 `game_record` 쿼리를 추가한다.
- [ ] `stadium` 추천 목록과 normalized name 조회 메서드를 추가한다.
- [ ] 경기 상세용 batter record/user 조합 조회 메서드를 추가한다.
- [ ] 테스트를 다시 돌려 컴파일 단계가 맞는지 확인한다.

## Chunk 2: 서비스와 DTO

### Task 3: v2 request/response DTO 추가

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/request/MatchCandidateQueryRequest.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/request/MatchCreateRequest.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/response/MatchCandidateItemResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/response/MatchCandidatesResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/response/MatchRecordItemResponse.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/dto/match/response/MatchDetailResponse.java`

- [ ] v2 화면 흐름에 맞는 최소 응답 필드만 담는다.
- [ ] 후보 카드에는 날짜/시간/지역/구장명만 넣는다.
- [ ] 상세 응답에는 경기 정보, 기록 남긴 사람 목록, 내 기록 존재 여부를 넣는다.

### Task 4: query/command service 구현

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/MatchQueryService.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/MatchCommandService.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/service/game/StadiumNameNormalizer.java`

- [ ] 후보 조회 로직을 구현한다.
- [ ] `expandScope=false`면 같은 시/도+구/군, `true`면 같은 시/도까지 확장한다.
- [ ] shared 경기 생성 시 기존 `stadium` exact normalized match를 우선 사용하고, 없으면 생성한다.
- [ ] 경기 상세는 creator 여부와 batter record 참여 여부를 함께 계산한다.

## Chunk 3: 컨트롤러와 예외 처리

### Task 5: `/api/matches` 컨트롤러 추가

**Files:**
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/controller/game/MatchController.java`
- Create: `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/game/InvalidMatchRequestException.java`
- Modify: `backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java`

- [ ] `GET /api/matches/candidates`
- [ ] `POST /api/matches`
- [ ] `GET /api/matches/{gameId}`
- [ ] validation/도메인 오류 응답을 기존 에러 응답 형식에 맞춘다.

## Chunk 4: 회귀 검증

### Task 6: 기존/신규 테스트 함께 확인

**Files:**
- Modify as needed from previous tasks

- [ ] `./gradlew test --tests 'com.chepchep2.mybaseballrecord.service.game.*' --tests 'com.chepchep2.mybaseballrecord.service.stats.*' --tests 'com.chepchep2.mybaseballrecord.controller.game.*' --tests 'com.chepchep2.mybaseballrecord.controller.stats.*'`
- [ ] 신규 `/api/matches` 테스트가 통과하는지 확인한다.
- [ ] 기존 홈/최근 경기/상세가 안 깨졌는지 확인한다.

## Chunk 5: 문서 동기화

### Task 7: v2 문서와 API 문서 갱신

**Files:**
- Modify: `docs/mbr-v2/current-erd.md`
- Modify: `docs/mbr-v2/screen-design.md`
- Modify: `docs/mbr-v2/scenario.md`
- Create or Modify: `docs/mbr-v2/backend-api-structure.md`

- [ ] 실제 구현한 `/api/matches` 계약과 문서를 맞춘다.
- [ ] 남은 미구현 범위(내 기록 입력 연결, 인증 API)를 다음 단계로 분리 표기한다.
