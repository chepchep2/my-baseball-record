# Baseball Record V1 Overview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개인 선수 전용 모바일 웹 기록 관리 서비스 v1의 프론트엔드/백엔드 구현 범위, 공통 계약, 인증 구조, 구현 순서를 하나의 상위 문서에서 고정한다.

**Architecture:** 사용자는 구글 로그인으로 인증을 시작하고, 백엔드는 구글 인증 성공 후 앱 내부 `access token / refresh token`을 발급해 세션을 관리한다. 프론트엔드는 기록 확인 요약 화면을 기본 홈으로 두고 상세 기록 화면으로 깊이를 나누는 모바일 웹을 구현하며, 백엔드는 인증, 경기 기록 저장, 통합 기록 조회 API를 제공한다.

**Tech Stack:** Frontend: Next.js, React, JavaScript, App Router. Backend: Java, Spring Boot, Spring Security, Spring Data JPA, Validation, PostgreSQL. Shared: Google OAuth login, JWT access token, refresh token, JSON API.

**Auth Policy:** Google 로그인만 지원한다. Google 계정 1개는 앱 계정 1개와 연결되며, 서로 다른 Google 계정은 서로 다른 앱 계정으로 취급한다. v1은 계정 연결과 계정 병합을 지원하지 않는다.

---

## Scope Source

이 문서는 아래 상위 문서를 구현 단위로 분해하는 용도다.

- `docs/prd.md`
- `docs/superpowers/specs/2026-03-17-scenario-v1.md`
- `docs/superpowers/specs/2026-03-16-baseball-record-v1-design.md`
- `docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- `docs/superpowers/specs/2026-03-17-frontend-ascii-wireframes.md`

이 문서는 새 제품 범위를 추가하지 않는다.

## Product Scope Summary

v1의 구현 범위는 아래로 고정한다.

- 개인 선수 전용
- 모바일 웹 우선
- 기록 확인 요약 화면이 기본 홈
- 상세 기록 화면에서 필터와 상세 지표를 조회
- 구글 로그인 기반 인증
- 앱 내부 `access token / refresh token` 세션
- 경기 생성
- 타자 기록 입력
- 투수 기록 입력
- 시즌/통산 기록 조회
- 경기 유형 필터 조회
- 빈 기록 화면
- 입력 중 값 유지
- 이탈 경고

v1에서 제외한다.

- 이메일/비밀번호 인증
- 최근 경기 전용 화면/API
- 팀/공동 입력
- 외부 기록 자동 연동
- 상세 로그 입력
- 다중 선수 프로필

## Responsibility Split

### Frontend Owns

- 구글 로그인 시작과 복귀 처리
- 앱 세션 상태 관리
- 보호 페이지 진입 제어
- 기록 확인 요약 화면
- 상세 기록 화면
- 빈 상태, 로딩, 조회 실패, 인증 만료 화면 처리
- 경기 정보 입력 단계
- 타자/투수 기록 입력 단계
- 저장 실패, 재시도, 이탈 경고 UI

### Backend Owns

- 구글 로그인 결과 검증
- 앱 내부 access token / refresh token 발급
- refresh token 회전 또는 무효화 정책
- 사용자 식별과 개인 소유 데이터 분리
- 경기 생성 API
- 타자 기록 저장 API
- 투수 기록 저장 API
- 시즌/통산 통합 기록 조회 API
- 필드/도메인 검증
- 공통 에러 응답

### Shared Contract Points

- 로그인 성공 후 세션 생성 방식
- 토큰 재발급 방식
- 로그아웃 방식
- 로그아웃 UI 위치
- 기록 조회 query model
- 기록 저장 DTO
- 지표 반올림 및 이닝 표시 규칙
- 요약 화면 대표 지표 세트
- 필드 오류 응답 형식
- 저장 실패 후 재시도 규칙
- 인증 만료 후 복구 규칙

## Authentication Architecture

### User-facing Flow

1. 사용자가 인증 화면에서 `Google로 계속하기`를 누른다.
2. 구글 인증이 성공하면 프론트는 `idToken`을 백엔드에 전달한다.
3. 백엔드는 구글 사용자 식별 정보를 검증한다.
4. 백엔드는 구글 계정 식별자에 연결된 사용자를 조회하고, 최초 로그인인 경우 사용자 레코드를 자동 생성한다.
5. 백엔드는 앱 내부 `access token / refresh token`을 발급한다.
6. 프론트는 이 토큰으로 보호 영역에 진입한다.

### Backend Auth Model

- 구글 계정 식별자와 앱 사용자 계정을 연결한다.
- 계정 1개는 선수 프로필 1개와 연결된다.
- 이메일/비밀번호 해시 저장은 v1에서 필요하지 않다.
- refresh token은 서버가 무효화할 수 있어야 한다.
- 로그아웃 UI는 기록 확인 요약 화면을 아래로 내렸을 때 보이는 하단 저강도 영역을 기본으로 한다.

### Frontend Auth Model

- 프론트는 구글 로그인 시작과 콜백 아티팩트 수집을 담당한다.
- 앱 내부 세션 저장은 백엔드 발급 토큰 기준으로 한다.
- 인증이 없는 상태에서 `/records`, `/games/new` 접근 시 인증 화면으로 보낸다.
- 앱 세션 발급 성공 후 기본 홈은 `/records`다.

## Frontend Runtime Note

- 프론트 구현은 Next.js App Router 기준으로 진행한다.
- 배포는 Vercel을 우선 검토한다.

## Read And Write Model

### Read Model

기록 조회 화면은 아래 입력값 조합으로 데이터를 요청한다.

- 범위: `current_season | career | season`
- 시즌 값: `seasonYear`
- 기록 축: `batter | pitcher`
- 경기 필터: `all | league | non_official`

### Write Model

경기 입력 화면의 사용자 행동은 하나의 `저장`으로 보이고,
백엔드 계약도 `원자적 저장 API`로 고정한다.

이 방향의 이유:

- 모바일 실패 처리 단순화
- 프론트 저장 버튼이 사용자 개념과 일치
- 중간 실패와 롤백 복잡도 감소

## Current Shared Contracts

### Auth Contract

- 구글 로그인 성공 후 백엔드 입력값은 `idToken`이다.
- 앱 세션은 `access token / refresh token` 구조를 사용한다.
- logout은 refresh token 무효화를 포함한다.
- 구글 로그인 실패/취소, 앱 세션 만료, refresh 실패 응답 형식을 함께 다룬다.

### Stats Contract

- 요청 query shape
- batter summary/detail 응답 shape
- pitcher summary/detail 응답 shape
- 0 지표 응답 shape
- 시즌/통산 표현 방식

### Game Write Contract

- 경기 정보 DTO
- 타자 기록 DTO
- 투수 기록 DTO
- 저장 성공 응답

저장 API는 사용자 관점에서 하나의 원자적 저장 모델을 사용한다.

### Validation Contract

- 교차 필드 검증 규칙
- 필드 에러 포맷
- 서버/클라이언트 검증 일치 기준

### Error Envelope

- `400`
- `401`
- `403`
- `404`
- `409`
- `500`

각 상태는 공통 JSON envelope를 사용한다.

## Non-happy-path Coverage

상세 계획은 아래 상태를 반드시 구현 범위에 포함해야 한다.

- 구글 로그인 실패
- 인증 만료
- refresh 실패
- 기록 조회 실패
- 빈 기록 상태
- 저장 중
- 저장 실패
- 이탈 확인

## Current Plan Links

- `docs/superpowers/specs/2026-03-17-api-contract-v1.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-backend.md`

이 문서는 위 상세 문서들이 공유해야 할 현재 기준을 정리하는 상위 개요 문서다.

Run order:
3. `docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`

- [ ] **Step 4: 이전 상세 계획 문서를 대체 대상으로 표시한다**

기존 계획 문서는 `deprecated` 취급하고, 새 문서가 기준임을 명시한다.

- [ ] **Step 5: 커밋한다**

```bash
git add docs/superpowers/plans/2026-03-17-baseball-record-v1-overview.md
git commit -m "docs: add v1 implementation overview plan"
```
