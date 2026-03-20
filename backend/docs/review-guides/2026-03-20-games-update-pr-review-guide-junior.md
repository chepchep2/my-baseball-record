# Games Update PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged가 `backend`만 포함
- [ ] `.env` staged 없음
- [ ] 이번 PR이 `PUT /api/games/{id}` 범위를 넘지 않음

## 1. 계약 확인

- [ ] `PUT /api/games/{id}`가 `200`을 반환
- [ ] 응답이 개별 경기 상세 구조와 일치
- [ ] validation 실패 시 `400 VALIDATION_ERROR`

## 2. 핵심 규칙 확인

- [ ] `playedAt` 수정 불가
- [ ] `gameType` 수정 불가
- [ ] `seasonYear` 수정 불가
- [ ] 그 외 필드는 수정 가능

## 3. APIdog 수동 검증

- Method: `PUT`
- URL: `http://localhost:8080/api/games/{gameId}`
- Headers:
  - Name: `Content-Type`, Value: `application/json`
  - Name: `Authorization`, Value: `Bearer {{access_token}}`

주의:
- 현재 보안 설정이 `permitAll`이면 Authorization 없이도 통과할 수 있다.
- 그래도 리뷰/수동 검증은 Authorization 헤더를 넣은 요청 기준으로 확인한다.

성공 케이스:
- [ ] memo/teamName/opponentName 등 변경 후 `200`

실패 케이스:
- [ ] `playedAt` 변경 시도 -> 에러
- [ ] `gameType` 변경 시도 -> 에러
- [ ] `seasonYear` 변경 시도 -> 에러

## 4. 테스트

```bash
./gradlew test --tests "*Game*Update*"
./gradlew cleanTest test
```

- [ ] 모두 PASS
