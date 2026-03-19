# Auth Google API PR Review Guide (2026-03-19)

## 1. PR Scope Check

- 대상 API가 `POST /api/auth/google` 하나인지 확인
- `frontend` 파일이 커밋 대상에 포함되지 않았는지 확인
- `backend/.env.example`만 포함되고 실제 `.env`는 제외됐는지 확인

## 2. Contract & Behavior
### Success 응답 shape

- [AuthController.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/controller/auth/AuthController.java)
- [AuthTokenResponse.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/response/AuthTokenResponse.java)
- [AuthControllerTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/controller/auth/AuthControllerTest.java)

검토 포인트:
- `accessToken`, `refreshToken`, 만료시각, `user` 필드가 계약과 일치하는가
- `provider`가 `GOOGLE`로 반환되는가

### Error envelope & code 매핑

- [ApiErrorResponse.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/ApiErrorResponse.java)
- [GlobalExceptionHandler.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/exception/GlobalExceptionHandler.java)
- [GoogleLoginRequest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/dto/auth/request/GoogleLoginRequest.java)

검토 포인트:
- `idToken` 공백/누락 시 `400 VALIDATION_ERROR` + `fieldErrors`가 내려오는가
- `InvalidGoogleTokenException -> 400 INVALID_GOOGLE_TOKEN` 매핑이 맞는가
- `GoogleAuthFailedException -> 401 GOOGLE_AUTH_FAILED` 매핑이 맞는가

## 3. Domain/Service/Repository Integrity

- [AuthService.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/service/auth/AuthService.java)
- [User.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/domain/auth/User.java)
- [RefreshToken.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/domain/auth/RefreshToken.java)
- [UserRepository.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/UserRepository.java)
- [RefreshTokenRepository.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/repository/auth/RefreshTokenRepository.java)

검토 포인트:
- 신규/기존 사용자 분기 로직이 테스트 의도와 일치하는가
- refresh token 저장이 누락되지 않았는가
- JPA 매핑(테이블/컬럼/unique/FK)이 migration과 일치하는가

## 4. Persistence & Migration

- [V1__create_auth_tables.sql](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/resources/db/migration/V1__create_auth_tables.sql)
- [AuthRepositoryTest.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/test/java/com/chepchep2/mybaseballrecord/repository/auth/AuthRepositoryTest.java)

검토 포인트:
- `auth_user`, `auth_refresh_token` 생성 SQL이 현재 엔티티와 일치하는가
- FK 제약이 실제 저장 시나리오를 막지 않는가(테스트로 검증됨)

## 5. Runtime Wiring

- [AuthConfig.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java)
- [CommonConfig.java](/Users/chosangwoo/dev/projects/my-baseball-record/backend/src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/CommonConfig.java)

검토 포인트:
- `GoogleTokenVerifierImpl`/`JwtTokenIssuerImpl` 빈이 연결되어 있는가
- 공통 `Clock`이 `CommonConfig`에서 주입되는가

## 6. Verification Evidence

실행 확인 명령:

```bash
./gradlew test --tests "*AuthControllerTest"
./gradlew test --tests "*AuthServiceTest"
./gradlew test --tests "*AuthRepositoryTest"
./gradlew cleanTest test
```

모두 통과해야 merge 가능.
