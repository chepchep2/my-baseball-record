# 백엔드 Auth 브랜치 리뷰 가이드

이 문서는 `feat/backend-kakao-auth-v1` 브랜치를 리뷰할 때 사용하는 가이드이다.
이번 범위는 카카오 로그인 기반 auth 계약 전환과 cookie 기반 세션 흐름이다.
실제 수동 검증은 브라우저 + APIdog 조합으로 확인한다.

리뷰 대상 API:

- `GET /api/auth/kakao/login`
- `GET /api/auth/kakao/callback`
- `GET /api/auth/session`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

---

## 0. 먼저 확인할 것

- [ ] 현재 브랜치가 `feat/backend-kakao-auth-v1`인지 확인한다.
- [ ] staged 또는 커밋 대상에 `frontend` 파일이 섞이지 않았는지 확인한다.
- [ ] 실제 비밀값(`.env`, 카카오 키 값)이 커밋 대상에 포함되지 않았는지 확인한다.

---

## 1. 문서 기준 먼저 확인

리뷰 전에 아래 문서를 먼저 본다.

- 설계 문서: [backend-design.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/backend-design.md)
- 구현 계획 문서: [2026-03-27-backend-implementation-plan.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-27-backend-implementation-plan.md)

특히 아래를 먼저 확인한다.

- `code`는 백엔드가 직접 받는 구조인지
- `refresh token`은 `HttpOnly cookie` 기준인지
- `GET /api/auth/session`, `POST /api/auth/refresh`, `POST /api/auth/logout`이 cookie 기반인지
- 프론트 인증 관련 요청이 `credentials: include`를 전제로 하는지

---

## 2. 코드 리뷰 포인트

### 2.1 Controller 계약

파일:

- [AuthController.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java)
- [AuthControllerTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java)
- [AuthRefreshControllerTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthRefreshControllerTest.java)
- [AuthLogoutControllerTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthLogoutControllerTest.java)

체크:

- [ ] `GET /api/auth/kakao/login`이 redirect 응답을 반환한다.
- [ ] `GET /api/auth/kakao/callback`이 `code` query parameter를 받는다.
- [ ] callback 처리 후 `refreshToken` cookie를 설정한다.
- [ ] `GET /api/auth/session`은 body 없이 cookie만으로 동작한다.
- [ ] `POST /api/auth/refresh`는 body 없이 cookie만으로 동작한다.
- [ ] `POST /api/auth/refresh`가 rotation된 `refreshToken` cookie를 다시 내려준다.
- [ ] `POST /api/auth/logout`은 body 없이 cookie만으로 동작한다.
- [ ] `POST /api/auth/logout`이 `refreshToken` cookie를 비운다.

### 2.2 Service와 domain 규칙

파일:

- [AuthService.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java)
- [KakaoOauthClient.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/KakaoOauthClient.java)
- [KakaoUserInfo.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/KakaoUserInfo.java)
- [User.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/domain/auth/User.java)
- [RefreshTokenRepository.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java)
- [AuthServiceTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthServiceTest.java)
- [AuthRefreshServiceTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthRefreshServiceTest.java)
- [AuthLogoutServiceTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/service/auth/AuthLogoutServiceTest.java)

체크:

- [ ] 카카오 callback login이 신규/기존 사용자 분기를 모두 처리하는지 확인한다.
- [ ] `refresh token` 저장과 rotation이 유지되는지 확인한다.
- [ ] `GET /api/auth/session`은 기존 refresh token을 유지하고 access token만 새로 발급하는지 확인한다.
- [ ] logout 시 서버 저장 refresh token을 무효화하는지 확인한다.
- [ ] provider가 `KAKAO`로 저장/응답되는지 확인한다.

### 2.3 Config와 보안 조건

파일:

- [AuthConfig.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java)
- [SecurityConfig.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/SecurityConfig.java)
- [application-local.properties](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/resources/application-local.properties)
- [application-prod.properties](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/resources/application-prod.properties)
- [backend/.env.example](/Users/chosangwoo/dev/projects/my-baseball-record/backend/.env.example)

체크:

- [ ] Kakao client id/secret/redirect uri 설정 이름이 문서와 맞는지 확인한다.
- [ ] `.env.example`의 환경변수 이름이 실제 설정 파일과 맞는지 확인한다.
- [ ] `https://my-baseball-record.vercel.app`와 로컬 origin에 대한 CORS 허용이 있는지 확인한다.
- [ ] credential 요청 허용(`allowCredentials`)이 유지되는지 확인한다.
- [ ] 배포 환경 기본 cookie 정책이 `Secure=true`, `SameSite=None`인지 확인한다.
- [ ] 실제 secret 값이 문서/코드에 하드코딩되지 않았는지 확인한다.

---

## 3. APIdog 검증 순서

이번 auth 리뷰에서 APIdog로 확인할 때는 아래 순서를 따른다.

### 3.1 Kakao 로그인 시작

- Method: `GET`
- URL: `http://localhost:8080/api/auth/kakao/login`
- Headers: 없음
- Body: 없음

체크:

- [ ] `302` 또는 `3xx` redirect 응답인지 확인한다.
- [ ] `Location` 헤더가 카카오 authorize URL인지 확인한다.

실제 검증 메모:

- 브라우저에서 직접 여는 흐름으로 확인하는 것이 가장 자연스럽다.
- `http://127.0.0.1:8080/api/auth/kakao/login` 또는 `http://localhost:8080/api/auth/kakao/login` 둘 다 사용 가능하다.
- 시작 응답에서는 `Location`이 카카오 authorize URL로 가는지 확인한다.

### 3.2 Kakao callback

실제 callback은 브라우저에서 리다이렉트 흐름으로 확인하는 것이 더 자연스럽다.
APIdog에서는 임시로 아래처럼 확인할 수 있다.

- Method: `GET`
- URL: `http://localhost:8080/api/auth/kakao/callback?code=임시-code`
- Headers: 없음
- Body: 없음

체크:

- [ ] 성공 시 `Set-Cookie`에 `refreshToken`이 내려오는지 확인한다.
- [ ] `Location` 헤더가 프론트 앱 redirect target인지 확인한다.

실제 검증 메모:

- 브라우저 개발자도구 `Network` 탭에서 callback 요청을 직접 확인한다.
- 확인할 값:
  - `GET /api/auth/kakao/callback?code=...`
  - `302`
  - `Location: http://localhost:3000/auth`
  - `Set-Cookie: refreshToken=...`
- APIdog에서 callback을 직접 재현하기보다 브라우저 흐름으로 보는 것이 더 정확하다.

주의:

- 이 요청은 실제 Kakao code가 있어야 완전한 검증이 가능하다.
- 따라서 구현 초반에는 MockMvc 테스트와 브라우저 로그인 흐름 검증이 더 중요하다.

### 3.3 Session bootstrap

- Method: `GET`
- URL: `http://localhost:8080/api/auth/session`
- Headers:
  - `Cookie: refreshToken={{refresh_token}}`
- Body: 없음

체크:

- [ ] `200` 응답인지 확인한다.
- [ ] 응답에 `accessToken`, `expiresIn`, `user.id`, `user.nickname`이 있는지 확인한다.
- [ ] 응답에 `Set-Cookie`가 새로 오지 않는지 확인한다.

실제 검증 메모:

- `refresh_token` 값은 callback 또는 가장 최근 `refresh` 응답의 `Set-Cookie`에서 복사한다.
- APIdog의 Header는 아래 형식을 그대로 넣어야 한다.

```text
Name: Cookie
Value: refreshToken={{refresh_token}}
```

### 3.4 Refresh

- Method: `POST`
- URL: `http://localhost:8080/api/auth/refresh`
- Headers:
  - `Cookie: refreshToken={{refresh_token}}`
- Body: 없음

체크:

- [ ] `200` 응답인지 확인한다.
- [ ] 응답에 `accessToken`, `expiresIn`만 있는지 확인한다.
- [ ] body에 `refreshToken`이 더 이상 포함되지 않는지 확인한다.
- [ ] `Set-Cookie`에 rotation된 `refreshToken`이 다시 내려오는지 확인한다.

실제 검증 메모:

- `Authorization: Bearer ...`로 보내면 안 된다.
- 반드시 `Cookie` 헤더를 사용한다.
- Header 예시:

```text
Name: Cookie
Value: refreshToken={{refresh_token}}
```

- refresh 성공 후에는 이전 토큰이 아니라 응답의 새 `Set-Cookie`에 들어 있는 refresh token으로 다음 테스트를 이어간다.

### 3.5 Logout

- Method: `POST`
- URL: `http://localhost:8080/api/auth/logout`
- Headers:
  - `Cookie: refreshToken={{refresh_token}}`
- Body: 없음

체크:

- [ ] `204 No Content`인지 확인한다.
- [ ] `Set-Cookie`로 `refreshToken`이 비워지는지 확인한다.
- [ ] 이후 같은 `refreshToken`으로 `/api/auth/refresh`를 호출하면 실패하는지 확인한다.

실제 검증 메모:

- logout 후 같은 refresh token으로 다시 `POST /api/auth/refresh`를 호출했을 때 `401`이 나오면 정상이다.
- 실제 확인된 기대 에러 코드는 `REFRESH_TOKEN_REVOKED`이다.

---

## 4. 이후 보호된 API를 확인할 때

auth 구현이 끝나고 game/stats API 검증으로 넘어가면 아래 header를 사용한다.

- Header name: `Authorization`
- Header value: `Bearer {{access_token}}`

즉 protected API는 cookie가 아니라 access token header 기준으로 검증한다.

예시:

```http
Authorization: Bearer {{access_token}}
```

---

## 5. 테스트 명령

아래 명령은 현재 auth 범위 검증 기준이다.

```bash
cd /Users/chosangwoo/dev/projects/my-baseball-record/backend
./gradlew test --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthControllerTest" --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthRefreshControllerTest" --tests "com.chepchep2.mybaseballrecord.controller.auth.AuthLogoutControllerTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthServiceTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthRefreshServiceTest" --tests "com.chepchep2.mybaseballrecord.service.auth.AuthLogoutServiceTest"
```

체크:

- [ ] 전부 PASS

---

## 6. 리뷰 메모

이 문서는 현재 auth 구현과 실제 수동 검증 결과를 반영한 상태다.
추가로 실제 리뷰 시 아래도 같이 본다.

- local 환경변수 이름
  - `KAKAO_CLIENT_ID`
  - `KAKAO_CLIENT_SECRET`
  - `KAKAO_REDIRECT_URI`
  - `KAKAO_FRONTEND_REDIRECT_URI`
  - `AUTH_COOKIE_SECURE`
  - `AUTH_COOKIE_SAME_SITE`
  - `AUTH_COOKIE_DOMAIN`
- prod 기본 cookie 정책
  - `Secure=true`
  - `SameSite=None`
