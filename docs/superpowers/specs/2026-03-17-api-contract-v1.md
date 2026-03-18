# Baseball Record V1 API Contract

## Goal

Baseball Record v1의 프론트엔드와 백엔드가 함께 따라야 할 API 계약을 정의한다.

이 문서는 아래 영역의 요청/응답 형식과 에러 계약을 고정한다.

- 구글 로그인 기반 인증
- 앱 세션 발급 및 갱신
- 로그아웃
- 누적 기록 조회
- 경기 생성
- 경기 수정
- 경기 삭제
- 캘린더 기반 경기 관리 조회
- 개별 경기 상세 조회
- 공통 검증 에러

## Scope

이 문서에 포함한다.

- Google 로그인 성공 후 앱 세션 발급
- refresh token 기반 세션 갱신
- 로그아웃
- 시즌/통산/시즌 선택 기록 조회
- 경기 정보 + 타자/투수 기록 생성
- 경기 수정
- 경기 삭제
- 월간 캘린더용 경기 수 조회
- 날짜별 경기 목록 조회
- 개별 경기 상세 조회
- 공통 에러 envelope

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

### Error Envelope

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

### ParticipationType

```text
BATTER
PITCHER
BOTH
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

#### Success Response `200`

```json
{
  "accessToken": "access-token",
  "refreshToken": "refresh-token",
  "accessTokenExpiresAt": "2026-03-18T10:00:00Z",
  "refreshTokenExpiresAt": "2026-04-17T10:00:00Z",
  "user": {
    "id": 1,
    "displayName": "조상우",
    "email": "user@gmail.com",
    "provider": "GOOGLE"
  }
}
```

#### Error Cases

- `400 INVALID_GOOGLE_TOKEN`
- `401 GOOGLE_AUTH_FAILED`

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
  "accessTokenExpiresAt": "2026-03-18T11:00:00Z",
  "refreshTokenExpiresAt": "2026-04-17T11:00:00Z",
  "user": {
    "id": 1,
    "displayName": "조상우",
    "email": "user@gmail.com",
    "provider": "GOOGLE"
  }
}
```

#### Error Cases

- `401 REFRESH_TOKEN_INVALID`
- `401 REFRESH_TOKEN_EXPIRED`
- `401 REFRESH_TOKEN_REVOKED`

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

## 2. Stats Query

### GET `/api/stats`

누적 기록 조회용 API다.

#### Query Parameters

- `scope`: `current_season | career | season`
- `seasonYear`: `scope=season`일 때 필수
- `recordType`: `batter | pitcher`
- `gameFilter`: `all | league | non_official`

#### Batter Response Example

```json
{
  "scope": "current_season",
  "seasonYear": 2026,
  "recordType": "batter",
  "gameFilter": "all",
  "summary": {
    "games": 24,
    "atBats": 88,
    "hits": 31,
    "battingAverage": "0.352",
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
  "scope": "current_season",
  "seasonYear": 2026,
  "recordType": "pitcher",
  "gameFilter": "all",
  "summary": {
    "games": 12,
    "inningsPitchedDisplay": "31.2",
    "era": "2.84",
    "whip": "1.11",
    "strikeOuts": 29,
    "wins": 3
  },
  "details": {
    "losses": 1,
    "saves": 0,
    "holds": 2,
    "runsAllowed": 12,
    "earnedRuns": 10,
    "hitsAllowed": 24,
    "walks": 7,
    "hitByPitch": 1,
    "homeRunsAllowed": 1,
    "battersFaced": 121,
    "opponentBattingAverage": "0.221",
    "strikeoutsPerNine": "8.24"
  },
  "isEmpty": false
}
```

## 3. Game Write

### POST `/api/games`

새 경기를 저장한다.

#### Request

```json
{
  "gameInfo": {
    "playedAt": "2026-03-18",
    "seasonYear": 2026,
    "gameType": "LEAGUE",
    "teamName": "블루스톰",
    "opponentName": "레전드",
    "memo": "비 오는 날 경기"
  },
  "batter": {
    "plateAppearances": 4,
    "atBats": 3,
    "singles": 1,
    "doubles": 1,
    "triples": 0,
    "homeRuns": 1,
    "walks": 1,
    "strikeOuts": 0,
    "hitByPitch": 0,
    "runsBattedIn": 3,
    "runs": 2,
    "stolenBases": 0,
    "caughtStealing": 0,
    "sacrificeHits": 0
  },
  "pitcher": null
}
```

#### Rules

- `seasonYear`는 생략 가능하다.
- `seasonYear`가 생략되면 서버는 `playedAt` 기준 연도를 기본값으로 사용한다.
- `seasonYear`가 함께 전달되면 해당 값을 우선 저장한다.
- `playedAt`과 `seasonYear`는 생성 시점에만 함께 결정한다.

#### Success Response `201`

create/update 성공 응답은 개별 경기 상세 응답 전체를 반환한다.

### PUT `/api/games/{gameId}`

기존 경기 기록을 수정한다.

#### Rules

- `playedAt`은 수정 불가
- `gameType`은 수정 불가
- `seasonYear`는 수정 불가
- 나머지 입력값은 수정 가능

#### Success Response `200`

create/update 성공 응답은 개별 경기 상세 응답 전체를 반환한다.

### DELETE `/api/games/{gameId}`

기존 경기 기록을 삭제한다.

#### Success Response

`204 No Content`

## 4. Game Management Query

### GET `/api/games/calendar`

월간 캘린더 셀에 표시할 경기 수를 조회한다.

#### Query Parameters

- `year`
- `month`

#### Response Example

```json
{
  "year": 2026,
  "month": 3,
  "counts": [
    { "date": "2026-03-12", "count": 1 },
    { "date": "2026-03-18", "count": 2 },
    { "date": "2026-03-25", "count": 4 }
  ]
}
```

### GET `/api/games`

선택 날짜의 경기 목록을 조회한다.

#### Query Parameters

- `date`

#### Ordering

- 기본 정렬은 `playedAt desc`, 같은 날짜 안에서는 `updatedAt desc`를 사용한다.
- 각 카드 식별과 상세 진입을 위해 `id`는 필수다.
- v1은 선택 날짜 기준 조회만 지원하므로 pagination은 생략한다.

#### Response Example

```json
{
  "date": "2026-03-18",
  "games": [
    {
      "id": 101,
      "playedAt": "2026-03-18",
      "gameType": "LEAGUE",
      "participationType": "BOTH"
    },
    {
      "id": 102,
      "playedAt": "2026-03-18",
      "gameType": "NON_OFFICIAL",
      "participationType": "BATTER"
    }
  ]
}
```

## 5. Draft Recovery Contract

임시 저장과 복구는 프론트 localStorage에서 처리한다.

### Storage Keys

- 생성: `draft:create:{userId}`
- 수정: `draft:edit:{userId}:{gameId}`

### Rules

- 사용자당 생성 draft는 1개만 유지한다.
- 수정 draft는 gameId별로 1개씩 유지한다.
- 생성 draft와 수정 draft는 서로 다른 key를 사용한다.
- 최종 저장 성공 시 draft를 삭제한다.
- 복구 확인 모달에서 `아니오`를 누르면 해당 draft를 삭제한다.

### TTL

- draft TTL은 7일이다.
- 7일이 지난 draft는 복구 대상에서 제외하고 삭제한다.

### GET `/api/games/{gameId}`

개별 경기 상세를 조회한다.

#### Response Example

```json
{
  "id": 101,
  "gameInfo": {
    "playedAt": "2026-03-18",
    "seasonYear": 2026,
    "gameType": "LEAGUE",
    "teamName": "블루스톰",
    "opponentName": "레전드",
    "memo": "비 오는 날 경기"
  },
  "participationType": "BOTH",
  "batter": {
    "plateAppearances": 4,
    "atBats": 3,
    "singles": 1,
    "doubles": 1,
    "triples": 0,
    "homeRuns": 1,
    "walks": 1,
    "strikeOuts": 0,
    "hitByPitch": 0,
    "runsBattedIn": 3,
    "runs": 2,
    "stolenBases": 0,
    "caughtStealing": 0,
    "sacrificeHits": 0
  },
  "pitcher": {
    "innings": 1,
    "additionalOuts": 0,
    "runsAllowed": 0,
    "earnedRuns": 0,
    "hitsAllowed": 1,
    "walks": 0,
    "strikeOuts": 2,
    "hitByPitch": 0,
    "homeRunsAllowed": 0,
    "battersFaced": 4,
    "wins": 0,
    "losses": 0,
    "saves": 0,
    "holds": 0
  }
}
```
