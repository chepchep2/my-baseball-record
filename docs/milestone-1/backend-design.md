# My Baseball Record 1차 마일스톤 백엔드 설계

## 1. 문서 목적

이 문서는 My Baseball Record 1차 마일스톤에서 필요한 백엔드 범위를 고정하기 위한 설계 문서이다.

이번 1차는 사회인 야구 타자 기록을 빠르게 남기고, 홈 화면에서 시즌/통산 기록과 최근 경기 기록을 확인하는 흐름을 지원하는 데 집중한다.

백엔드는 `작은 범위`, `강한 계약`, `테스트 우선` 원칙을 따른다.
한 번에 큰 기능을 밀어 넣기보다, API를 책임 단위로 나누고 각 API의 요청/응답/검증 규칙을 명확히 정의한다.

## 2. 설계 방향

이번 1차 백엔드는 아래 방향으로 설계한다.

- API는 최대한 책임 단위로 나눈다.
- 단, 각 API의 응답은 너무 빈약하지 않게 설계한다.
- 프론트가 바로 사용할 수 있도록 계산값과 표시용 필드를 함께 제공한다.
- 프론트 검증이 있더라도, 백엔드는 동일한 검증 규칙을 다시 적용한다.
- 인증은 카카오 로그인 기반으로 설계하되, 세션 기반이 아닌 JWT 기반으로 유지한다.

이 문서는 아래 접근안 중 `분리된 API + 풍부한 응답`을 채택한다.

- 단일 홈 API + 단순 로그인 응답
- 분리된 API + 최소 응답
- 분리된 API + 풍부한 응답

채택 이유:

- API 책임을 분리하면서도 프론트 재사용성을 확보할 수 있다.
- 홈 화면 구성이 일부 바뀌더라도 API를 다시 뜯어고칠 가능성이 줄어든다.
- 나중에 기록 상세, 수정, 추가 카드 UI가 붙어도 응답 재활용이 쉽다.

## 3. 1차 범위

### 포함

- 카카오 로그인 시작
- 카카오 로그인 callback 처리
- 로그인 세션 부트스트랩 조회
- JWT access token 발급
- JWT refresh token 발급 및 재발급
- 로그아웃
- 경기 기록 생성
- 시즌 요약 조회
- 통산 요약 조회
- 최근 경기 목록 조회

### 제외

- 기록 상세 조회
- 기록 수정
- 기록 삭제
- 투수 기록 API
- 팀/리그 기능
- 소셜 인증 기능

## 4. 인증 설계

### 4.1 로그인 방식

카카오 로그인은 `authorization code` 방식으로 설계하되, `code`는 백엔드가 직접 받는다.

흐름:

1. 프론트는 백엔드의 카카오 로그인 시작 엔드포인트로 이동한다.
2. 백엔드는 카카오 로그인 페이지로 리다이렉트한다.
3. 사용자가 카카오 로그인에 성공하면 카카오는 백엔드 callback URI로 돌아온다.
4. 백엔드는 callback URI에서 `authorization code`를 직접 읽는다.
5. 백엔드는 카카오 서버와 직접 통신하여 access token 교환 및 사용자 검증을 수행한다.
6. 검증이 끝나면 refresh token cookie를 설정하고, 프론트 앱으로 다시 리다이렉트한다.

이 방식을 선택한 이유는 아래와 같다.

- 우리 프로젝트는 인증 책임을 백엔드에 집중시키는 구조를 원한다.
- 프론트가 callback 페이지에서 `code`를 읽고 다시 백엔드에 전달하는 단계를 두지 않으면 인증 흐름이 더 단순하다.
- OAuth callback, 카카오 토큰 교환, refresh token cookie 설정을 모두 백엔드에 모으면 책임 경계가 더 명확하다.

### 4.2 토큰 전달 방식

- `access token`은 응답 바디로 반환한다.
- `refresh token`은 `HttpOnly cookie`로 설정한다.

- `access token`은 실제 API 요청 시 사용하는 짧은 수명의 토큰이다.
- `refresh token`은 `access token`이 만료되었을 때 새 `access token`을 다시 발급받기 위한 장기 토큰이다.
- `refresh token`을 `HttpOnly cookie`에 넣으면 브라우저가 서버 요청 시 자동으로 쿠키를 첨부하지만, 프론트 JavaScript에서는 값을 직접 읽을 수 없다.

즉 `refresh token`은 프론트 코드가 직접 읽어서 보내는 값이 아니라, 브라우저 쿠키를 통해 서버에 자동 전달되는 값으로 본다.

쿠키 정책 원칙:

- `HttpOnly`
- `Secure`
- `SameSite`
- `Path=/api/auth`
- `Max-Age=30일`

브라우저/배포 조건 원칙:

- 프론트의 인증 관련 요청(`GET /api/auth/session`, `POST /api/auth/refresh`, `POST /api/auth/logout`)은 `credentials: include`를 사용한다.
- 백엔드는 인증 관련 CORS 설정에서 credential 요청을 허용한다.
- `refresh token` cookie의 `Domain`과 `SameSite` 값은 실제 프론트/백엔드 배포 도메인 구조에 맞춰 확정한다.
- 배포 환경에서는 `Secure` cookie를 전제로 한다.

### 4.3 로그인 성공 응답

카카오 callback 처리 자체는 JSON 응답을 반환하지 않고, 프론트 앱으로 리다이렉트한다.

프론트는 리다이렉트 이후 `로그인 세션 부트스트랩 조회 API`를 호출하여 access token과 최소 사용자 정보를 받는다.

로그인 세션 부트스트랩 응답에는 최소 사용자 정보를 함께 포함한다.

예시 필드:

- `accessToken`
- `expiresIn`
- `user.id`
- `user.nickname`
- `user.profileImageUrl`

이렇게 하면 프론트는 로그인 완료 후 별도 `/me` 호출 없이 최소 사용자 상태를 바로 잡을 수 있다.

### 4.4 인증 lifecycle

이번 1차 인증 범위는 아래 3개를 하나의 묶음으로 본다.

- 로그인
- refresh
- 로그아웃

인증 흐름은 아래와 같다.

1. 카카오 로그인 callback에서 백엔드는 사용자 검증을 마친다.
2. `refresh token`은 `HttpOnly cookie`로 저장한다.
3. 백엔드는 프론트 앱으로 리다이렉트한다.
4. 프론트는 `GET /api/auth/session`을 호출하여 `access token`과 최소 사용자 정보를 받는다.
5. 이후 프론트는 `access token`으로 API를 호출한다.
6. `access token`이 만료되면 프론트는 `/api/auth/refresh`를 호출한다.
7. 이때 `refresh token`은 브라우저 쿠키가 자동으로 서버에 전달한다.
8. 서버는 `refresh token`을 검증하고 새 `access token`을 발급한다.
9. 사용자는 다시 로그인하지 않고 계속 서비스를 사용할 수 있다.

로그아웃 시에는 아래 두 작업을 모두 수행한다.

- `refresh token cookie` 삭제
- 서버 저장 `refresh token` 무효화

### 4.5 JWT 만료 정책

이번 설계 문서에서는 사용자가 제공한 기존 인증 기준 중, 일반 사용자 로그인에 직접 관련된 정책만 사용한다.

- 사용자 access token: 15분
- 사용자 refresh token: 30일
- OAuth 로그인 흐름 보조 `session_id` 쿠키: 24시간

이번 1차 마일스톤에서는 일반 사용자 로그인 유지 기준을 `refresh token 30일`로 본다.

즉 사용자가 체감하는 로그인 유지 시간은 `access token 15분`이 아니라 `refresh token 30일`이다.
`access token`은 15분마다 만료될 수 있지만, `refresh token`이 유효한 동안은 `/api/auth/refresh`를 통해 새 `access token`을 재발급받을 수 있기 때문이다.

참고:

- `session_id` 쿠키는 일반 로그인 유지용 세션이 아니라, OAuth 로그인 왕복 과정에서 요청 흐름을 안전하게 이어주기 위한 보조 쿠키로 본다.
- 일반적인 로그인 유지 기준은 `access token`이 아니라 `refresh token` 만료 시점이다.
- 현재 문맥에서 JWT는 주로 `access token`을 의미한다고 이해하면 된다.

## 5. API 분리 원칙

이번 1차는 화면이 하나여도, 조회 API는 책임 기준으로 3개로 나눈다.

이유는 아래와 같다.

- 시즌 요약과 통산 요약은 같은 통계 shape를 공유하지만 범위가 다르다.
- 최근 경기 목록은 통계 요약이 아니라 경기 목록 조회이므로 응답 성격이 다르다.
- 홈 화면이 바뀌더라도 통계 API와 경기 목록 API를 독립적으로 재사용하기 쉽다.

백엔드는 아래처럼 책임별 API로 나눈다.

- 인증 API
  - 카카오 로그인 시작
  - 카카오 로그인 callback 처리
  - 로그인 세션 부트스트랩 조회
  - refresh
  - logout
- 기록 API
  - 경기 기록 생성
- 통계/조회 API
  - 시즌 요약
  - 통산 요약
  - 최근 경기 목록

즉 홈 화면이 하나라는 이유만으로 `GET /api/home` 같은 화면 종속 API로 묶지 않고, 도메인 책임 기준으로 나눈다.

## 5.1 데이터 저장 기준

이번 1차에서 경기 시각의 canonical 저장 필드는 `played_at`으로 본다.

- 프론트 입력은 `playedDate`, `playedHour`, `playedMinute`로 받는다.
- 백엔드는 이 입력값을 합쳐 `played_at` datetime 필드로 저장한다.
- 최근 경기 정렬, 시즌 필터링, 통계 집계의 기준은 모두 `played_at`으로 맞춘다.
- 응답에서는 프론트 사용성을 위해 다시 `playedDate`, `playedHour`, `playedMinute`, `playedAtLabel`로 풀어준다.

## 5.2 사용자 소유권 기준

모든 경기 기록은 인증된 현재 사용자에게 귀속된다.

- `games` 저장 시 `user_id`를 반드시 함께 저장한다.
- `POST /api/games` 요청 바디에는 `userId`를 받지 않는다.
- 백엔드는 JWT access token의 subject에서 현재 사용자 id를 읽어 `user_id`를 결정한다.
- `GET /api/stats?scope=...`, `GET /api/games/recent?limit=...`는 모두 현재 인증 사용자 기준으로만 조회한다.

## 6. API 목록

### 6.1 카카오 로그인 시작

`GET /api/auth/kakao/login`

역할:

- 카카오 로그인 페이지로 이동시키는 시작점이다.
- 프론트는 이 엔드포인트로 사용자를 보낸다.

요청:

- 요청 바디 없음

응답:

- 카카오 로그인 URL로 리다이렉트

### 6.2 카카오 로그인 callback 처리

`GET /api/auth/kakao/callback`

역할:

- 카카오가 돌려준 `authorization code`를 백엔드가 직접 받는다.
- 카카오와 토큰 교환 및 사용자 검증을 수행한다.
- `refresh token`을 `HttpOnly cookie`로 저장한다.
- 프론트 앱으로 다시 리다이렉트한다.

요청:

- query parameter `code`
- 필요 시 `state`

응답:

- 프론트 앱 URL로 리다이렉트

### 6.3 로그인 세션 부트스트랩 조회

`GET /api/auth/session`

역할:

- 로그인 완료 직후 프론트가 현재 로그인 세션을 초기화할 때 사용한다.
- 유효한 refresh token cookie를 바탕으로 `access token`과 최소 사용자 정보를 반환한다.

요청:

- 요청 바디 없음
- 브라우저가 자동으로 첨부한 `refresh token cookie`만으로 처리한다.

응답:

- `accessToken`
- `expiresIn`
- `user`
  - `id`
  - `nickname`
  - `profileImageUrl`

응답 예시:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.payload",
  "expiresIn": 900,
  "user": {
    "id": 7,
    "nickname": "초상우",
    "profileImageUrl": "https://k.kakaocdn.net/profile.png"
  }
}
```

### 6.4 토큰 재발급

`POST /api/auth/refresh`

역할:

- HttpOnly cookie의 refresh token을 검증한다.
- 새로운 access token을 발급한다.
- 필요 시 refresh token rotation을 수행한다.

요청:

- 요청 바디는 사용하지 않는다.
- 브라우저가 자동으로 첨부한 `refresh token cookie`만으로 처리한다.

응답:

- `accessToken`
- `expiresIn`

응답 예시:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-access.payload",
  "expiresIn": 900
}
```

설명:

- 프론트는 `refresh token` 문자열을 직접 읽어서 보내지 않는다.
- 프론트는 단순히 `/api/auth/refresh`를 호출한다.
- 실제 `refresh token` 전달은 브라우저 쿠키가 담당한다.

### 6.5 로그아웃

`POST /api/auth/logout`

역할:

- refresh token을 서버에서 무효화한다.
- refresh token cookie를 삭제한다.

응답:

- `204 No Content`

### 6.6 경기 기록 생성

`POST /api/games`

역할:

- 타자 경기 기록 1건을 생성한다.
- 입력값 검증과 계산을 모두 서버에서 수행한다.
- 생성된 경기 상세 전체를 응답으로 반환한다.
- 백엔드는 현재 인증 사용자의 `user_id`를 함께 저장한다.
- 저장 기준 시각은 `played_at` canonical field를 사용한다.

요청 필드:

- `playedDate`
- `playedHour`
- `playedMinute`
- `plateAppearances`
- `walksAndHitByPitch`
- `singles`
- `doubles`
- `triples`
- `homeRuns`

요청 예시:

```json
{
  "playedDate": "2026-03-27",
  "playedHour": 19,
  "playedMinute": 0,
  "plateAppearances": 5,
  "walksAndHitByPitch": 1,
  "singles": 2,
  "doubles": 0,
  "triples": 0,
  "homeRuns": 1
}
```

서버 계산 필드:

- `atBats`
- `hits`
- `battingAverage`
- `onBasePercentage`
- `sluggingPercentage`
- `ops`

응답:

- 생성된 경기 상세 전체

필수 응답 필드 예시:

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

응답 예시:

```json
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
  "battingAverage": 0.750,
  "onBasePercentage": 0.800,
  "sluggingPercentage": 1.500,
  "ops": 2.300
}
```

### 6.7 시즌 요약 조회

`GET /api/stats?scope=season`

역할:

- 현재 시즌 기준 타자 누적 기록 요약을 반환한다.

응답 예시 필드:

- `battingAverage`
- `ops`
- `hits`
- `onBasePercentage`
- `sluggingPercentage`

응답 예시:

```json
{
  "scope": "season",
  "battingAverage": 0.321,
  "ops": 0.912,
  "hits": 18,
  "onBasePercentage": 0.402,
  "sluggingPercentage": 0.510
}
```

### 6.8 통산 요약 조회

`GET /api/stats?scope=career`

역할:

- 통산 기준 타자 누적 기록 요약을 반환한다.

응답 shape는 시즌 요약과 동일하게 유지한다.

응답 예시 필드:

- `battingAverage`
- `ops`
- `hits`
- `onBasePercentage`
- `sluggingPercentage`

응답 예시:

```json
{
  "scope": "career",
  "battingAverage": 0.287,
  "ops": 0.801,
  "hits": 84,
  "onBasePercentage": 0.361,
  "sluggingPercentage": 0.440
}
```

### 6.9 최근 경기 목록 조회

`GET /api/games/recent?limit=3`

역할:

- 최근 경기 목록을 조회한다.
- 개수는 `limit` 파라미터로 받는다.
- 정렬 기준은 최근 생성 순서가 아니라 실제 경기 시각(`played_at`) 기준 내림차순이다.

이 API는 `최근 경기 3개 전용 API`가 아니라, 최근 경기 목록 조회 API로 설계한다.
현재 홈 화면에서는 `limit=3`을 사용하지만, 이후 화면 정책이 바뀌어도 API를 다시 만들지 않도록 한다.

응답은 리스트 전용 최소 응답이 아니라, 비교적 풍부한 경기 요약을 반환한다.

아이템 예시 필드:

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

응답 예시:

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
      "battingAverage": 0.750,
      "onBasePercentage": 0.800,
      "sluggingPercentage": 1.500,
      "ops": 2.300
    },
    {
      "gameId": 100,
      "playedDate": "2026-03-20",
      "playedHour": 14,
      "playedMinute": 10,
      "playedAtLabel": "3/20 14:10",
      "plateAppearances": 4,
      "walksAndHitByPitch": 0,
      "singles": 1,
      "doubles": 1,
      "triples": 0,
      "homeRuns": 0,
      "atBats": 4,
      "hits": 2,
      "battingAverage": 0.500,
      "onBasePercentage": 0.500,
      "sluggingPercentage": 0.750,
      "ops": 1.250
    }
  ]
}
```

## 7. 경기 생성 계산 규칙

경기 생성 시 서버는 아래 계산 규칙을 사용한다.

- `타수 = 타석 - 사사구`
- `안타 = 1루타 + 2루타 + 3루타 + 홈런`
- `타율 = 안타 / 타수`
- `출루율`, `장타율`, `OPS`는 서버 계산값으로 반환한다.

이 규칙은 프론트와 동일하더라도, 백엔드는 별도로 같은 로직을 보유하고 검증해야 한다.

## 8. 검증 규칙

백엔드는 아래 검증 규칙을 프론트와 동일하게 적용한다.

- 모든 숫자 입력값은 `0 이상 정수`
- 미래 날짜 입력 불가
- 오늘 날짜일 때 미래 시각 입력 불가
- `사사구 <= 타석`
- `안타의 합 <= 타수`
- `타수 = 타석 - 사사구`
- `안타 = 1루타 + 2루타 + 3루타 + 홈런`

오류 응답은 필드 단위로 식별 가능해야 하며, 공통 error envelope를 유지한다.

## 9. 응답 설계 원칙

- 생성 API는 `id만` 반환하지 않고 생성된 경기 상세 전체를 반환한다.
- 조회 API는 화면 책임에 맞게 분리하되, 응답은 지나치게 빈약하게 만들지 않는다.
- 홈 화면 전용이라고 해서 모든 데이터를 하나의 giant response로 합치지 않는다.
- 프론트가 반복 계산하지 않도록, 서버 계산값을 함께 제공한다.

## 10. 추후 확장 포인트

이번 1차 범위에는 포함하지 않지만, 현재 설계는 아래 확장을 고려한다.

- 경기 상세 조회 API
- 경기 수정 API
- 경기 삭제 API
- 상세 화면 도입
- 기록 카드 공유
- 투수 기록 확장

## 11. 구현 우선순위

백엔드 구현 우선순위는 아래 순서를 따른다.

1. 카카오 로그인
2. refresh
3. logout
4. 경기 기록 생성
5. 시즌 요약 조회
6. 통산 요약 조회
7. 최근 경기 목록 조회

각 API는 request/response/error와 검증 규칙까지 묶어서 작은 단위로 완성한다.
