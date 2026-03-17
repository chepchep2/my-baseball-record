# Baseball Record V1 API Contract

## Goal

Baseball Record v1의 프론트엔드와 백엔드가 함께 따라야 할 API 계약을 정의한다.

이 문서는 아래 영역의 요청/응답 형식과 에러 계약을 고정한다.

- 구글 로그인 기반 인증
- 앱 세션 발급 및 갱신
- 로그아웃
- 기록 조회
- 경기 기록 저장
- 공통 검증 에러

## Scope

이 문서에 포함한다.

- Google 로그인 성공 후 앱 세션 발급
- refresh token 기반 세션 갱신
- 로그아웃
- 시즌/통산/시즌 선택 기록 조회
- 경기 정보 + 타자/투수 기록 저장
- 공통 에러 envelope

이 문서에서 제외한다.

- 이메일/비밀번호 인증
- 최근 경기 API
- 팀/공동 입력 API
- 외부 기록 연동 API

## Contract Conventions

### Base Principles

- 모든 응답은 JSON을 사용한다.
- 시간은 ISO 8601 문자열을 사용한다.
- enum 값은 명시된 문자열만 허용한다.
- 클라이언트는 서버 응답을 기준으로 화면 상태를 갱신한다.

### Auth Model

- 사용자는 Google 로그인으로 인증을 시작한다.
- 프론트는 Google 인증 성공 후 `idToken`을 백엔드로 전달한다.
- 백엔드는 `idToken`을 검증하고 앱 내부 `accessToken`, `refreshToken`을 발급한다.
- 이후 앱 세션은 백엔드 발급 토큰으로 유지한다.
- Google 계정 1개는 앱 계정 1개와 연결된다.
- 서로 다른 Google 계정은 서로 다른 앱 계정으로 취급한다.
- v1은 계정 연결과 계정 병합을 지원하지 않는다.

### Error Envelope

모든 실패 응답은 아래 공통 구조를 사용한다.

```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해주세요.",
  "fieldErrors": [
    {
      "field": "batter.atBats",
      "message": "타수는 타석보다 클 수 없습니다."
    }
  ],
  "retryable": false
}
```

#### Fields

- `code`: 오류 코드
- `message`: 사용자 또는 로그용 기본 메시지
- `fieldErrors`: 필드 단위 오류 목록, 없으면 빈 배열 또는 생략 가능
- `retryable`: 재시도 가치가 있는 오류인지 여부

## Enums

### GameType

```text
LEAGUE
NON_OFFICIAL
```

### RecordType

```text
batter
pitcher
```

### StatsScope

```text
current_season
career
season
```

### GameFilter

```text
all
league
non_official
```

## 1. Auth

### POST `/api/auth/google`

Google 로그인 성공 후 앱 세션을 발급한다.

#### Request

```json
{
  "idToken": "google-id-token"
}
```

#### Request Notes

- `idToken`은 프론트가 Google 로그인 후 받은 토큰이다.
- 백엔드는 이 토큰을 검증한 뒤 사용자 식별과 세션 발급을 수행한다.
- 첫 로그인인 경우 사용자 레코드를 자동 생성할 수 있다.

#### Success Response `200`

```json
{
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "accessTokenExpiresAt": "2026-03-17T12:00:00Z",
  "refreshTokenExpiresAt": "2026-04-16T12:00:00Z",
  "user": {
    "id": 1,
    "displayName": "조상우",
    "email": "user@gmail.com",
    "provider": "GOOGLE"
  }
}
```

#### Error Cases

- `401 GOOGLE_AUTH_FAILED`
- `400 INVALID_GOOGLE_TOKEN`
- `500 INTERNAL_SERVER_ERROR`

## 2. Session Refresh

### POST `/api/auth/refresh`

refresh token으로 앱 세션을 갱신한다.

#### Request

```json
{
  "refreshToken": "refresh-token"
}
```

#### Success Response `200`

```json
{
  "accessToken": "new-access-token",
  "refreshToken": "new-refresh-token",
  "accessTokenExpiresAt": "2026-03-17T13:00:00Z",
  "refreshTokenExpiresAt": "2026-04-16T13:00:00Z"
}
```

#### Notes

- refresh token 재발급 여부는 이 문서 기준으로 `회전(rotation)`을 기본 전제로 한다.
- 프론트는 성공 시 기존 토큰을 새 토큰으로 교체한다.

#### Error Cases

- `401 REFRESH_TOKEN_EXPIRED`
- `401 REFRESH_TOKEN_INVALID`
- `401 REFRESH_TOKEN_REVOKED`

## 3. Logout

### POST `/api/auth/logout`

현재 앱 세션의 refresh token을 무효화한다.

#### Request

```json
{
  "refreshToken": "refresh-token"
}
```

#### Success Response `204`

응답 바디 없음.

#### Error Cases

- `401 REFRESH_TOKEN_INVALID`
- `401 REFRESH_TOKEN_REVOKED`

## 4. Stats Query

### GET `/api/stats`

기록 확인 요약 화면과 상세 기록 화면에서 현재 선택된 범위와 축에 맞는 누적 기록을 조회한다.

#### Query Parameters

- `scope`: `current_season | career | season`
- `seasonYear`: `scope=season`일 때 필수
- `recordType`: `batter | pitcher`
- `gameFilter`: `all | league | non_official`

#### Example

```text
/api/stats?scope=current_season&recordType=batter&gameFilter=all
```

```text
/api/stats?scope=season&seasonYear=2026&recordType=pitcher&gameFilter=league
```

#### Success Response `200`

`summary`는 기록 확인 요약 화면용 대표 지표 묶음이고,
`details`는 상세 기록 화면에서 보여줄 추가 지표 묶음이다.

```json
{
  "scope": "current_season",
  "seasonYear": 2026,
  "recordType": "batter",
  "gameFilter": "all",
  "summary": {
    "games": 24,
    "atBats": 79,
    "hits": 31,
    "battingAverage": "0.392",
    "ops": "0.898"
  },
  "details": {
    "plateAppearances": 88,
    "homeRuns": 3,
    "runsBattedIn": 18,
    "onBasePercentage": "0.410",
    "sluggingPercentage": "0.488",
    "singles": 22,
    "doubles": 5,
    "triples": 1,
    "walks": 9,
    "hitByPitch": 2,
    "stolenBases": 4,
    "caughtStealing": 1,
    "sacrificeHits": 2,
    "runs": 14
  },
  "isEmpty": false
}
```

#### Pitcher Response Example

```json
{
  "scope": "career",
  "seasonYear": null,
  "recordType": "pitcher",
  "gameFilter": "all",
  "summary": {
    "games": 12,
    "inningsPitchedDisplay": "31.2",
    "wins": 3,
    "era": "2.84",
    "whip": "1.11",
    "strikeOuts": 29
  },
  "details": {
    "losses": 1,
    "saves": 0,
    "holds": 2,
    "earnedRuns": 10,
    "runsAllowed": 12,
    "hitsAllowed": 24,
    "homeRunsAllowed": 1,
    "walks": 7,
    "hitByPitch": 1,
    "battersFaced": 121,
    "opponentBattingAverage": "0.221",
    "strikeoutsPerNine": "8.24"
  },
  "isEmpty": false
}
```

#### Empty Response Example

```json
{
  "scope": "current_season",
  "seasonYear": 2026,
  "recordType": "batter",
  "gameFilter": "all",
  "summary": {
    "games": 0,
    "atBats": 0,
    "hits": 0,
    "battingAverage": "0.000",
    "ops": "0.000"
  },
  "details": {
    "plateAppearances": 0,
    "homeRuns": 0,
    "runsBattedIn": 0,
    "onBasePercentage": "0.000",
    "sluggingPercentage": "0.000",
    "singles": 0,
    "doubles": 0,
    "triples": 0,
    "walks": 0,
    "hitByPitch": 0,
    "stolenBases": 0,
    "caughtStealing": 0,
    "sacrificeHits": 0,
    "runs": 0
  },
  "isEmpty": true
}
```

#### Notes

- `scope=season`일 때 `seasonYear`는 필수다.
- `scope=current_season`이면 서버가 현재 시즌 값을 계산해 응답에 포함할 수 있다.
- 빈 상태도 같은 response shape를 유지한다.
- batter `summary`는 `games, atBats, hits, battingAverage, ops` 기준으로 유지한다.
- pitcher `summary`는 `games, inningsPitchedDisplay, era, whip, strikeOuts, wins` 기준으로 유지한다.

## 5. Game Save

### POST `/api/games`

경기 정보와 타자/투수 기록을 하나의 저장 행동으로 처리하는 원자적 저장 API다.

#### Request

```json
{
  "game": {
    "playedAt": "2026-03-17",
    "seasonYear": 2026,
    "gameType": "LEAGUE",
    "teamName": "레전드",
    "opponentName": "블루스톰",
    "memo": "오늘 경기 메모"
  },
  "batter": {
    "plateAppearances": 4,
    "atBats": 3,
    "singles": 1,
    "doubles": 0,
    "triples": 0,
    "homeRuns": 1,
    "walks": 1,
    "strikeOuts": 1,
    "hitByPitch": 0,
    "runsBattedIn": 2,
    "runs": 1,
    "stolenBases": 0,
    "caughtStealing": 0,
    "sacrificeHits": 0
  },
  "pitcher": null
}
```

#### Request Notes

- `batter`, `pitcher`는 둘 중 하나만 있거나 둘 다 있을 수 있다.
- 둘 다 `null`이면 저장 불가다.
- `seasonYear`는 생략 가능하지만, 생략 시 서버가 `playedAt` 기준으로 계산할 수 있다.

#### Success Response `201`

```json
{
  "gameId": 101,
  "seasonYear": 2026,
  "savedRecordTypes": [
    "batter"
  ],
  "redirect": {
    "scope": "current_season",
    "recordType": "batter",
    "gameFilter": "all"
  }
}
```

#### Error Cases

- `400 VALIDATION_ERROR`
- `401 UNAUTHORIZED`
- `409 CONFLICT`

## 6. Validation Rules

서버와 클라이언트는 아래 규칙을 동일하게 적용해야 한다.

### Batter

- `atBats <= plateAppearances`
- `singles + doubles + triples + homeRuns <= atBats`
- 기본 세트 일부라도 입력되면 유효한 타자 기록 세트인지 검사

### Pitcher

- `earnedRuns <= runsAllowed`
- `extraOuts`는 `0 | 1 | 2`
- 기본 세트 일부라도 입력되면 유효한 투수 기록 세트인지 검사

### Save

- `batter`와 `pitcher`가 모두 비어 있으면 저장 불가

### Validation Error Example `400`

```json
{
  "code": "VALIDATION_ERROR",
  "message": "입력값을 확인해주세요.",
  "fieldErrors": [
    {
      "field": "batter.atBats",
      "message": "타수는 타석보다 클 수 없습니다."
    },
    {
      "field": "pitcher.earnedRuns",
      "message": "자책은 실점보다 클 수 없습니다."
    }
  ],
  "retryable": false
}
```

## 7. Error Codes

### `400`

- `VALIDATION_ERROR`
- `INVALID_GOOGLE_TOKEN`

### `401`

- `UNAUTHORIZED`
- `GOOGLE_AUTH_FAILED`
- `REFRESH_TOKEN_INVALID`
- `REFRESH_TOKEN_EXPIRED`
- `REFRESH_TOKEN_REVOKED`
- `SESSION_EXPIRED`

### `403`

- `FORBIDDEN`

### `404`

- `NOT_FOUND`

### `409`

- `CONFLICT`

### `500`

- `INTERNAL_SERVER_ERROR`

## 8. Contract Notes

- Google 로그인 성공 후 프론트는 백엔드에 `idToken`을 전달한다.
- API summary는 서버가 계산해 주는 전체 요약이며, 프론트 요약 화면은 그중 일부 대표 지표만 선택해 보여줄 수 있다.
- refresh token은 DB 저장과 회전(rotation)을 기본 전제로 한다.
- 타율과 OPS는 소수 셋째 자리까지 반환한다.
- ERA와 WHIP는 소수 둘째 자리까지 반환한다.
- 0분모 비율 지표는 `0.000` 또는 `0.00` 형식으로 반환한다.
- pitcher `inningsPitchedDisplay`는 `0.0 / 0.1 / 0.2` 형식을 사용한다.
- 프론트 요약 화면 대표 지표는 타자 `경기수, 타수, 총안타, 타율, OPS`, 투수 `경기수, 이닝, ERA, WHIP, 삼진, 승` 기준으로 사용한다.
