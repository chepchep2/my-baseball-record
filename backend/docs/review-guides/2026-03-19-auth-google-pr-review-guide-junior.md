# Auth Google PR 리뷰 가이드 (주니어용)

이 문서는 `POST /api/auth/google` PR을 처음 리뷰하는 사람 기준으로 만들었다.
아래 순서대로만 보면 된다.

---

## 0. 먼저 이것부터 확인 (1분)

- [ ] **staged(커밋 대상)** 파일이 `backend`만 포함하는지 확인한다.
- [ ] staged에 `frontend` 파일이 있으면 리뷰 중단하고 분리 요청한다.
- [ ] staged에 `.env` 파일이 있으면 즉시 제외 요청한다.

---

## 1. API 응답이 문서와 같은지 확인 (3분)

파일:
- [AuthController.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java)
- [AuthTokenResponse.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java)
- [AuthControllerTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java)

체크:
- [ ] `POST /api/auth/google`가 존재한다.
- [ ] 응답에 `accessToken`, `refreshToken`, `accessTokenExpiresAt`, `refreshTokenExpiresAt`, `user`가 있다.
- [ ] `user.provider` 값이 `GOOGLE`이다.

---

## 2. 잘못된 입력 처리 확인 (3분)

파일:
- [GoogleLoginRequest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/GoogleLoginRequest.java)
- [GlobalExceptionHandler.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java)
- [ApiErrorResponse.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/ApiErrorResponse.java)

체크:
- [ ] `idToken`이 비면 `400`을 반환한다.
- [ ] `code=VALIDATION_ERROR`를 반환한다.
- [ ] `fieldErrors`에 `idToken` 필드 정보가 들어간다.

---

## 3. Google 인증 실패 매핑 확인 (3분)

파일:
- [InvalidGoogleTokenException.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/InvalidGoogleTokenException.java)
- [GoogleAuthFailedException.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/auth/GoogleAuthFailedException.java)
- [GlobalExceptionHandler.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java)

체크:
- [ ] `InvalidGoogleTokenException` → `400 INVALID_GOOGLE_TOKEN`
- [ ] `GoogleAuthFailedException` → `401 GOOGLE_AUTH_FAILED`

---

## 4. 저장 로직 확인 (5분)

파일:
- [AuthService.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java)
- [User.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/domain/auth/User.java)
- [RefreshToken.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/domain/auth/RefreshToken.java)
- [UserRepository.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/UserRepository.java)
- [RefreshTokenRepository.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java)

체크:
- [ ] 기존 유저가 있으면 재사용한다.
- [ ] 신규 유저면 생성한다.
- [ ] refresh token을 저장한다.

---

## 5. DB 스키마 확인 (3분)

파일:
- [V1__create_auth_tables.sql](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/resources/db/migration/V1__create_auth_tables.sql)

체크:
- [ ] `auth_user` 테이블 존재
- [ ] `auth_refresh_token` 테이블 존재
- [ ] `auth_refresh_token.user_id`가 `auth_user.id`를 참조(FK)한다.

---

## 6. 테스트 실행으로 최종 확인 (2분)

아래 명령 실행:

```bash
./gradlew test --tests "*Auth*"
./gradlew cleanTest test
```

체크:
- [ ] 둘 다 PASS

---

## 7. APIdog 수동 검증 (3분)

### A. Google 로그인 요청

- Method: `POST`
- URL: `http://localhost:8080/api/auth/google`
- Headers:
  - Name: `Content-Type`
  - Value: `application/json`
- Body(JSON):

```json
{
  "idToken": "실제-google-id-token"
}
```

체크:
- [ ] `200` 응답
- [ ] 응답에 `accessToken`, `refreshToken`, `user` 포함

### B. PostProcessors 변수 저장(권장)

로그인 응답에서 아래 2개를 APIdog 환경변수로 저장해두면 다음 요청 검증이 쉬워진다.

- `access_token = response.body.accessToken`
- `refresh_token = response.body.refreshToken`

### C. Refresh 요청 검증

- Method: `POST`
- URL: `http://localhost:8080/api/auth/refresh`
- Headers:
  - Name: `Content-Type`
  - Value: `application/json`
- Body(JSON):

```json
{
  "refreshToken": "{{refresh_token}}"
}
```

체크:
- [ ] `200` 응답
- [ ] 새 `accessToken`, 새 `refreshToken` 반환
- [ ] refresh 후에는 `refresh_token` 환경변수를 새 값으로 갱신

---

## 리뷰 코멘트 템플릿

좋은 점:
- "테스트가 계약(성공/실패 케이스)을 잘 고정하고 있습니다."

수정 요청 예시:
- "`idToken` validation 실패 시 `fieldErrors.field`가 누락됩니다. `idToken`이 포함되게 수정 필요합니다."
- "`frontend` 파일이 같이 들어왔습니다. backend PR과 분리 부탁드립니다."
