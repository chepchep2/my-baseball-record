# Games Create PR 리뷰 가이드 (주니어용)

이 문서는 `feat/backend-games-create-v1` 브랜치의 `POST /api/games` 리뷰와 수동 검증 기준이다.

---

## 0. 범위 확인

- [ ] staged 파일이 `backend` 범위인지 확인
- [ ] `.env` 파일이나 secret 값이 staged에 없는지 확인
- [ ] 이번 PR이 `POST /api/games` 생성 계약 정리 범위를 넘지 않는지 확인

---

## 1. API 계약 확인

파일:
- `controller/game/GameCommandController.java`
- `dto/game/request/GameCreateRequest.java`
- `dto/game/response/GameDetailResponse.java`
- `GameCreateControllerTest`

체크:
- [ ] `POST /api/games`가 `201`을 반환한다
- [ ] 요청 body가 nested `gameInfo`/`batter` 구조가 아니라 flat 구조다
- [ ] 아래 필드를 받는다
  - `playedDate`
  - `playedHour`
  - `playedMinute`
  - `plateAppearances`
  - `walksAndHitByPitch`
  - `singles`
  - `doubles`
  - `triples`
  - `homeRuns`
- [ ] 응답이 flat 경기 상세 구조를 반환한다
  - `gameId`
  - `playedDate`
  - `playedHour`
  - `playedMinute`
  - `playedAtLabel`
  - `plateAppearances`
  - `walksAndHitByPitch`
  - `singles`
  - `doubles`
  - `triples`
  - `homeRuns`
  - `atBats`
  - `hits`
  - `battingAverage`
  - `onBasePercentage`
  - `sluggingPercentage`
  - `ops`
- [ ] validation 실패 시 `400 VALIDATION_ERROR`를 반환한다

---

## 2. 생성 규칙 확인

파일:
- `service/game/GameCommandService.java`
- `domain/game/BatterRecord.java`
- `exception/game/InvalidGameCreateException.java`
- `GameCreateServiceTest`

체크:
- [ ] `playedDate`, `playedHour`, `playedMinute`를 합쳐 `played_at`으로 저장한다
- [ ] `user_id`는 요청 body가 아니라 현재 인증 사용자 기준으로 저장한다
- [ ] `walksAndHitByPitch <= plateAppearances`를 서버에서 다시 검증한다
- [ ] `hits <= atBats`를 서버에서 다시 검증한다
- [ ] 오늘 날짜의 미래 시각 입력을 거부한다
- [ ] 서버 계산값이 설계 문서와 일치한다
  - `atBats = plateAppearances - walksAndHitByPitch`
  - `hits = singles + doubles + triples + homeRuns`
  - `battingAverage`
  - `onBasePercentage`
  - `sluggingPercentage`
  - `ops`

---

## 3. DB 스키마/저장소 확인

파일:
- `db/migration/V2__create_game_tables.sql`
- `db/migration/V5__change_game_record_played_at_to_timestamp.sql`
- `domain/game/GameRecord.java`
- `repository/game/*`
- `GameRepositoryTest`

체크:
- [ ] `game_record.played_at`이 시간까지 저장할 수 있는 타입으로 맞춰졌는지 확인
- [ ] `played_at` entity 타입이 `LocalDateTime`으로 맞춰졌는지 확인
- [ ] `user_id` FK와 batter FK 저장이 기존 제약과 충돌하지 않는지 확인

---

## 4. APIdog 수동 검증

### A. 성공 케이스

- Method: `POST`
- URL: `http://localhost:8080/api/games`
- Header:
  - Name: `Content-Type`
  - Value: `application/json`
- Header:
  - Name: `Authorization`
  - Value: `Bearer {{access_token}}`

Body 예시:

```json
{
  "playedDate": "2026-03-27",
  "playedHour": 19,
  "playedMinute": 0,
  "plateAppearances": 5,
  "walksAndHitByPitch": 1,
  "singles": 2,
  "doubles": 0,
  "triples": 0,
  "homeRuns": 1
}
```

기대:
- [ ] `201`
- [ ] 응답에 `gameId`, `playedAtLabel`, 계산 필드가 포함된다
- [ ] `atBats=4`, `hits=3`, `ops=2.300` 같이 계산 결과가 맞는다

### B. 실패 케이스

예시 1:
- `playedDate` 누락

예시 2:
- `walksAndHitByPitch > plateAppearances`

예시 3:
- 과거가 아닌 미래 시각

기대:
- [ ] `400`
- [ ] `code=VALIDATION_ERROR`
- [ ] `fieldErrors`에 실패 필드가 포함된다

---

## 5. 테스트 실행

```bash
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameCreateControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameCreateServiceTest"
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.game.GameDetailControllerTest" --tests "com.chepchep2.mybaseballrecord.controller.game.GameUpdateDeleteControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameDetailServiceTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameUpdateServiceTest" --tests "com.chepchep2.mybaseballrecord.repository.game.GameRepositoryTest"
```

체크:
- [ ] 모두 PASS
