# Games Create PR 리뷰 가이드 (주니어용)

이 문서는 `POST /api/games` PR을 처음 리뷰하는 사람 기준이다.

---

## 0. 범위 확인

- [ ] staged 파일이 `backend`만 포함하는지 확인
- [ ] `.env` 파일이 staged에 없는지 확인
- [ ] 이번 PR이 `POST /api/games` 범위를 넘지 않는지 확인

---

## 1. API 계약 확인

파일:
- `controller/game/*`
- `dto/game/request/*`
- `dto/game/response/*`
- `GameCreateControllerTest`

체크:
- [ ] `POST /api/games`가 `201`을 반환한다
- [ ] 성공 응답이 개별 경기 상세 응답 구조와 일치한다
- [ ] validation 실패 시 `400 VALIDATION_ERROR`를 반환한다

---

## 2. 생성 규칙 확인

파일:
- `service/game/*`
- `domain/game/*`
- `GameCreateServiceTest`

체크:
- [ ] `seasonYear` 생략 시 `playedAt` 연도로 저장한다
- [ ] `seasonYear` 전달 시 전달값을 우선 저장한다
- [ ] game + batter/pitcher가 원자적으로 저장된다

---

## 3. DB 스키마/저장소 확인

파일:
- `db/migration/V2__create_game_tables.sql`
- `repository/game/*`
- `GameRepositoryTest`

체크:
- [ ] game 테이블 및 하위 기록 테이블이 migration과 엔티티에 일치한다
- [ ] FK/unique 제약이 테스트 시나리오와 충돌하지 않는다

---

## 4. APIdog 수동 검증

### A. 성공 케이스

- Method: `POST`
- URL: `http://localhost:8080/api/games`
- Header:
  - Name: `Content-Type`
  - Value: `application/json`
- 필요 시 Header:
  - Name: `Authorization`
  - Value: `Bearer {{access_token}}`
- Body: 계약 문서의 create 예시 JSON

기대:
- [ ] `201` 응답
- [ ] 응답에 gameInfo/participationType/batter/pitcher 구조가 포함

### B. 실패 케이스

- 필수값 누락 또는 숫자 규칙 위반 body로 호출

기대:
- [ ] `400`
- [ ] `code=VALIDATION_ERROR`
- [ ] `fieldErrors`에 실패 필드가 노출

---

## 5. 테스트 실행

```bash
./gradlew test --tests "*GameCreate*"
./gradlew test --tests "*GameRepositoryTest"
./gradlew cleanTest test
```

체크:
- [ ] 모두 PASS
