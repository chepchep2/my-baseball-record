# Stats + Recent Query PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged가 `backend`만 포함
- [ ] `.env` staged 없음
- [ ] 이번 PR이 `GET /api/stats`, `GET /api/games/recent` 범위를 넘지 않음

기준 문서:
- `/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/backend-design.md`
- `/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-27-backend-implementation-plan.md`

## 1. stats 계약 확인

- [ ] `GET /api/stats?scope=season`이 `200`을 반환
- [ ] `GET /api/stats?scope=career`가 `200`을 반환
- [ ] 응답이 아래 6개 필드만 포함하는지 확인
  - `scope`
  - `battingAverage`
  - `ops`
  - `hits`
  - `onBasePercentage`
  - `sluggingPercentage`
- [ ] `scope=monthly` 같은 잘못된 값이면 `400 VALIDATION_ERROR`

## 2. recent 계약 확인

- [ ] `GET /api/games/recent?limit=3`이 `200`을 반환
- [ ] 응답이 `items` wrapper를 갖는지 확인
- [ ] 각 item에 아래 필드가 들어있는지 확인
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
- [ ] recent 정렬이 `played_at DESC`인지 확인
- [ ] `limit` 값이 반영되는지 확인

## 3. APIdog 수동 검증

공통 헤더:
- Name: `Authorization`
- Value: `Bearer {{access_token}}`

### 3.1 시즌 요약

- Method: `GET`
- URL: `http://localhost:8080/api/stats?scope=season`

기대:
- [ ] `200`
- [ ] `scope=season`
- [ ] `battingAverage`, `ops`, `hits`, `onBasePercentage`, `sluggingPercentage` 존재

예시 응답:

```json
{
  "scope": "season",
  "battingAverage": "0.321",
  "ops": "0.912",
  "hits": 18,
  "onBasePercentage": "0.402",
  "sluggingPercentage": "0.510"
}
```

### 3.2 통산 요약

- Method: `GET`
- URL: `http://localhost:8080/api/stats?scope=career`

기대:
- [ ] `200`
- [ ] `scope=career`

### 3.3 stats 실패 케이스

- Method: `GET`
- URL: `http://localhost:8080/api/stats?scope=monthly`

기대:
- [ ] `400`
- [ ] `code=VALIDATION_ERROR`
- [ ] `fieldErrors[0].field=scope`

예시 응답:

```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해주세요.",
  "fieldErrors": [
    {
      "field": "scope",
      "message": "scope는 season 또는 career만 허용합니다."
    }
  ],
  "retryable": false
}
```

### 3.4 recent 성공 케이스

- Method: `GET`
- URL: `http://localhost:8080/api/games/recent?limit=3`

기대:
- [ ] `200`
- [ ] `items.length <= 3`
- [ ] 첫 번째 item이 가장 최근 `playedAt` 경기인지 확인

예시 응답:

```json
{
  "items": [
    {
      "gameId": 101,
      "playedDate": "2026-03-27",
      "playedHour": 19,
      "playedMinute": 0,
      "playedAtLabel": "3/27 19:00",
      "plateAppearances": 5,
      "walksAndHitByPitch": 1,
      "singles": 2,
      "doubles": 0,
      "triples": 0,
      "homeRuns": 1,
      "atBats": 4,
      "hits": 3,
      "battingAverage": "0.750",
      "onBasePercentage": "0.800",
      "sluggingPercentage": "1.500",
      "ops": "2.300"
    }
  ]
}
```

### 3.5 recent 인증 실패 케이스

- Method: `GET`
- URL: `http://localhost:8080/api/games/recent?limit=3`
- Authorization 헤더 제거

기대:
- [ ] `401`
- [ ] `code=ACCESS_TOKEN_REQUIRED`

## 4. 테스트

```bash
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.stats.StatsQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.stats.StatsQueryServiceTest" --tests "com.chepchep2.mybaseballrecord.controller.game.GameQueryControllerTest" --tests "com.chepchep2.mybaseballrecord.service.game.GameRecentQueryServiceTest"
```

- [ ] PASS
