# Games Detail PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged가 `backend`만 포함
- [ ] `.env` staged 없음
- [ ] 이번 PR이 `GET /api/games/{id}` 범위를 넘지 않음

## 1. 계약 확인

- [ ] `GET /api/games/{id}`가 `200`을 반환
- [ ] 응답 구조가 개별 경기 상세 계약과 일치
- [ ] 없는 id는 `404 GAME_NOT_FOUND`

기준 문서:
- `docs/superpowers/specs/2026-03-17-api-contract-v1.md`의 `GET /api/games/{gameId}`

## 2. 핵심 규칙 확인

- [ ] 게임이 있으면 gameInfo/participationType 반환
- [ ] 타자 기록이 없으면 `batter: null`
- [ ] 투수 기록이 없으면 `pitcher: null`
- [ ] gameId가 없으면 공통 에러 envelope로 `GAME_NOT_FOUND`

## 3. APIdog 수동 검증

- Method: `GET`
- URL: `http://localhost:8080/api/games/{gameId}`
- Headers:
  - Name: `Authorization`, Value: `Bearer {{access_token}}` (권장)

주의:
- 현재 보안 설정이 `permitAll`이면 Authorization 없이도 통과할 수 있다.
- 그래도 리뷰/수동 검증은 Authorization 헤더를 넣은 요청 기준으로 확인한다.

성공 케이스:
- [ ] 기존 gameId로 요청 시 `200`
- [ ] 응답에 `id`, `gameInfo.playedAt`, `participationType` 확인
- [ ] batter/pitcher 값이 저장 데이터와 일치하는지 확인

실패 케이스:
- [ ] 존재하지 않는 gameId(`999999` 등) 요청
- [ ] `404` + `code=GAME_NOT_FOUND` 확인

## 4. 테스트

```bash
./gradlew test --tests "*Game*Detail*"
./gradlew cleanTest test
```

- [ ] 모두 PASS
