# Games Delete PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged가 `backend`만 포함
- [ ] `.env` staged 없음
- [ ] 이번 PR이 `DELETE /api/games/{id}` 범위를 넘지 않음

## 1. 계약 확인

- [ ] `DELETE /api/games/{id}`가 `204`를 반환
- [ ] 성공 응답 body 없음
- [ ] 미존재 id 처리 정책(`404` 또는 `204`)이 문서/테스트/코드에 일치

## 2. 삭제 정합성 확인

- [ ] game 삭제 시 하위 batter/pitcher도 정리되는지 확인
- [ ] 이후 조회 시 해당 데이터가 남지 않는지 확인

## 3. APIdog 수동 검증

- Method: `DELETE`
- URL: `http://localhost:8080/api/games/{gameId}`
- Headers:
  - 필요 시 Name: `Authorization`, Value: `Bearer {{access_token}}`

체크:
- [ ] 존재 gameId 삭제 -> `204`
- [ ] 같은 id 재삭제 -> 정책에 맞는 응답 확인

## 4. 테스트

```bash
./gradlew test --tests "*Game*Delete*"
./gradlew cleanTest test
```

- [ ] 모두 PASS
