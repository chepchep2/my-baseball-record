# Stats Query PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged가 `backend`만 포함
- [ ] `.env` staged 없음
- [ ] 이번 PR이 `GET /api/stats` 범위를 넘지 않음

## 1. 계약 확인

- [ ] `GET /api/stats`가 `200`을 반환
- [ ] `recordType=batter` 응답 구조가 계약과 일치
- [ ] `recordType=pitcher` 응답 구조가 계약과 일치
- [ ] `scope=season`에서 `seasonYear` 누락 시 `400 VALIDATION_ERROR`

기준 문서:
- `docs/superpowers/specs/2026-03-17-api-contract-v1.md` 의 `2. Stats Query`

## 2. 핵심 규칙 확인

- [ ] `scope=current_season`이면 현재 연도 기준 집계
- [ ] `scope=career`이면 전체 연도 집계
- [ ] `scope=season`이면 전달한 `seasonYear` 기준 집계
- [ ] `gameFilter=league`는 `LEAGUE` 경기만 집계
- [ ] `gameFilter=non_official`는 `NON_OFFICIAL` 경기만 집계
- [ ] 데이터가 없으면 `isEmpty=true`

## 3. APIdog 수동 검증

- Method: `GET`
- URL: `http://localhost:8080/api/stats`
- Query Params:
  - `scope`
  - `seasonYear` (필요한 경우만)
  - `recordType`
  - `gameFilter`

예시(Query Params 입력):
- batter 현재시즌 전체:
  - `scope=current_season`
  - `recordType=batter`
  - `gameFilter=all`
- pitcher 통산 리그전:
  - `scope=career`
  - `recordType=pitcher`
  - `gameFilter=league`
- season 검증 에러 확인용:
  - `scope=season`
  - `recordType=batter`
  - `gameFilter=all`
  - (`seasonYear` 미입력)
- Headers:
  - Name: `Authorization`, Value: `Bearer {{access_token}}` (권장)
  - Name: `Content-Type`, Value: `application/json` (GET에서는 생략 가능)

주의:
- 현재 보안 설정이 `permitAll`이면 Authorization 없이도 통과할 수 있다.
- 그래도 리뷰/수동 검증은 Authorization 헤더를 넣은 요청 기준으로 확인한다.

성공 케이스 1 (batter):
- [ ] `scope=current_season&recordType=batter&gameFilter=all`
- [ ] 응답에 `summary.atBats`, `summary.hits`, `summary.battingAverage`, `details.onBasePercentage` 존재 확인

성공 케이스 2 (pitcher):
- [ ] `scope=career&recordType=pitcher&gameFilter=league`
- [ ] 응답에 `summary.era`, `summary.whip`, `details.opponentBattingAverage`, `details.strikeoutsPerNine` 존재 확인

실패 케이스:
- [ ] `scope=season&recordType=batter&gameFilter=all` (seasonYear 없음)
- [ ] `400` + `code=VALIDATION_ERROR` + `fieldErrors[0].field=seasonYear` 확인

## 4. 테스트

```bash
./gradlew test --tests "*Stats*"
./gradlew cleanTest test
```

- [ ] 모두 PASS
