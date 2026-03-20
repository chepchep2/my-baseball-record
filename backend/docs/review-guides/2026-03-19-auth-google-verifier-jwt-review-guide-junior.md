# Auth Google Verifier/JWT PR 리뷰 가이드 (주니어용)

## 0. 범위 확인

- [ ] staged(커밋 대상)에 `backend`만 있는지 확인
- [ ] `.env` 파일이 staged에 없는지 확인

## 1. Google 검증기 구현 확인

파일:
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/GoogleTokenVerifierImpl.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/GoogleTokenInfoHttpClient.java`

체크:
- [ ] `aud`가 `auth.google.client-id`와 다르면 실패 처리
- [ ] `exp`가 현재 시각보다 과거면 실패 처리
- [ ] 토큰 정보 조회 예외가 `GoogleAuthFailedException`으로 매핑되는지 확인

## 2. JWT 발급기 구현 확인

파일:
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/auth/JwtTokenIssuerImpl.java`

체크:
- [ ] access 토큰에 `tokenType=access`
- [ ] refresh 토큰에 `tokenType=refresh`
- [ ] 만료 시간이 설정값(`auth.jwt.*-ttl-seconds`)을 따르는지 확인

## 3. 설정 연결 확인

파일:
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/AuthConfig.java`
- `src/main/java/com/chepchep2/mybaseballrecord/infrastructure/config/CommonConfig.java`

체크:
- [ ] `GoogleTokenVerifierImpl` 빈 등록
- [ ] `JwtTokenIssuerImpl` 빈 등록
- [ ] `Clock` 빈이 공통 설정(`CommonConfig`)에 있는지 확인
- [ ] `auth.google.client-id`, `auth.jwt.secret` 등 프로퍼티를 주입하는지 확인

## 4. 테스트 확인

파일:
- `src/test/java/com/chepchep2/mybaseballrecord/infrastructure/auth/GoogleTokenVerifierImplTest.java`
- `src/test/java/com/chepchep2/mybaseballrecord/infrastructure/auth/JwtTokenIssuerImplTest.java`

실행:
```bash
./gradlew test --tests "*GoogleTokenVerifierImplTest" --tests "*JwtTokenIssuerImplTest"
./gradlew cleanTest test
```

체크:
- [ ] 둘 다 `BUILD SUCCESSFUL`
