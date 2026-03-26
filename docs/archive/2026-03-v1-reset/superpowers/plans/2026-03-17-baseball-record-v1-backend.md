# Baseball Record V1 Backend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 백엔드를 구성해 Google 로그인 기반 인증, 누적 기록 조회, 캘린더 기반 경기 관리 조회, 경기 생성/수정/삭제 API를 제공한다.

**Architecture:** `backend/` 아래에 Spring Boot + Java 애플리케이션을 구성하고, `auth`, `game`, `stats` 도메인을 나눈다. 인증은 Google `idToken` 검증 후 앱 내부 세션 토큰을 발급하는 구조로 설계하고, 경기 관리 API는 캘린더 조회, 날짜별 목록, 개별 경기 상세, 생성/수정/삭제를 함께 제공한다.

## Scope Summary

- Google 로그인 검증
- 앱 내부 access token / refresh token 발급
- refresh token 회전과 무효화
- 개인 사용자 레코드 생성/조회
- 경기 생성 API
- 경기 수정 API
- 경기 삭제 API
- 개별 경기 상세 조회 API
- 월간 캘린더 경기 수 조회 API
- 날짜별 경기 목록 조회 API
- 시즌/통산 통합 기록 조회 API

## Domain Areas

### Auth

- User
- AuthIdentity
- RefreshToken

### Game

- Game
- BatterRecord
- PitcherRecord
- ParticipationType

### Stats

- BatterStatsCalculator
- PitcherStatsCalculator
- StatsQueryService

## API Areas

- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/stats`
- `GET /api/games/calendar`
- `GET /api/games?date=...`
- `GET /api/games/{id}`
- `POST /api/games`
- `PUT /api/games/{id}`
- `DELETE /api/games/{id}`

## Write Policy

- 경기 중 점진 입력의 중간값은 서버에 부분 저장하지 않는다.
- 서버 저장은 최종 저장 시점의 `POST /api/games`, `PUT /api/games/{id}`만 처리한다.
- 생성/수정 중 임시 저장과 복구는 프론트의 localStorage 정책으로 처리한다.
- `POST /api/games`는 `201 Created`와 개별 경기 상세 응답 전체를 반환한다.
- `PUT /api/games/{id}`는 `200 OK`와 개별 경기 상세 응답 전체를 반환한다.
- 수정에서는 `playedAt`, `gameType`, `seasonYear`를 변경할 수 없다.
- 생성에서는 `seasonYear` 생략을 허용하고, 생략 시 `playedAt` 기준 연도를 서버가 기본값으로 사용한다.

## Chunk 1: Auth

- [ ] Google idToken 검증과 앱 세션 발급
- [ ] refresh token 재발급
- [ ] logout 무효화

## Chunk 2: Stats

- [ ] 누적 기록 summary/details 조회
- [ ] 시즌/통산/연도/경기 유형 필터 지원

## Chunk 3: Game Management Read

- [ ] 월간 캘린더 경기 수 조회
- [ ] 날짜별 경기 목록 조회
- [ ] 개별 경기 상세 조회
- [ ] 날짜별 경기 목록의 `playedAt desc`, `updatedAt desc` 정렬 규칙을 적용한다

## Chunk 4: Game Write

- [ ] 새 경기 생성
- [ ] 경기 수정
- [ ] 경기 삭제
- [ ] 수정 시 날짜/경기 유형 불변 규칙 적용

## Chunk 5: Validation And Errors

- [ ] 공통 error envelope 적용
- [ ] 필드 검증 규칙 구현
- [ ] 삭제/수정 실패 케이스 정리
