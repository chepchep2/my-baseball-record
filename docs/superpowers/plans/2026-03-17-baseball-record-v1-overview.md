# Baseball Record V1 Overview Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 개인 선수 전용 모바일 웹 기록 관리 서비스 v1의 프론트엔드/백엔드 구현 범위, 공통 계약, 인증 구조, 구현 순서를 하나의 상위 문서에서 고정한다.

**Architecture:** 사용자는 구글 로그인으로 인증을 시작하고, 백엔드는 구글 인증 성공 후 앱 내부 `access token / refresh token`을 발급해 세션을 관리한다. 프론트엔드는 하단 탭바 중심 구조로 홈, 기록, 생성, 경기, 내 정보를 제공한다. `기록`은 누적 기록 상세, `경기`는 캘린더 기반 경기 관리, `개별 경기 상세`는 수정/삭제의 진입점으로 둔다.

**Tech Stack:** Frontend: Next.js, React, JavaScript, App Router. Backend: Java, Spring Boot, Spring Security, Spring Data JPA, Validation, PostgreSQL. Shared: Google OAuth login, JWT access token, refresh token, JSON API.

## Product Scope Summary

- 홈 화면
- 기록 화면
- 생성 화면
- 경기 화면
- 내 정보 화면
- 개별 경기 상세 화면
- 경기 생성
- 경기 수정
- 경기 삭제
- 캘린더 기반 경기 관리
- 시즌/통산 누적 기록 조회
- 생성/수정 화면 임시 저장과 복구

## Responsibility Split

### Frontend Owns

- 하단 탭바 구조
- 홈 화면
- 기록 화면
- 생성 화면
- 경기 화면
- 개별 경기 상세 화면
- 내 정보 화면
- 삭제 확인 모달

### Backend Owns

- Google 로그인 검증
- 앱 세션 토큰 발급/갱신/무효화
- 누적 기록 조회 API
- 월간 캘린더 경기 수 조회 API
- 날짜별 경기 목록 조회 API
- 개별 경기 상세 조회 API
- 경기 생성/수정/삭제 API

### Shared Contract Points

- 로그아웃 위치와 동작
- 누적 기록 summary/details 구조
- 경기 카드 목록 응답 구조
- 개별 경기 상세 응답 구조
- 수정 시 읽기 전용 필드 정책
- 삭제 확인 후 삭제 흐름
- 생성/수정 임시 저장 정책

## Authentication Architecture

1. 사용자가 인증 화면에서 `Google로 계속하기`를 누른다.
2. 구글 인증이 성공하면 프론트는 `idToken`을 백엔드에 전달한다.
3. 백엔드는 구글 사용자 식별 정보를 검증한다.
4. 백엔드는 앱 내부 `access token / refresh token`을 발급한다.
5. 프론트는 이 토큰으로 보호 영역에 진입한다.

## Navigation Model

- 하단 탭 순서: `홈 / 기록 / 생성 / 경기 / 내 정보`
- 하단 탭은 홈, 기록, 생성, 경기, 내 정보, 개별 경기 상세 화면에서 노출한다.
- 수정 모드에서는 하단 탭을 숨긴다.

## Read And Write Model

### Read Model

- `GET /api/stats`
- `GET /api/games/calendar`
- `GET /api/games?date=...`
- `GET /api/games/{id}`

### Write Model

- `POST /api/games`
- `PUT /api/games/{id}`
- `DELETE /api/games/{id}`

## Non-happy-path Coverage

- 로그인 실패
- 인증 만료
- 누적 기록 조회 실패
- 캘린더 조회 실패
- 경기 목록 조회 실패
- 저장 실패
- 수정 실패
- 삭제 실패
- 입력 중 이탈
- 브라우저 재진입 후 복구 확인

## Current Plan Links

- `docs/superpowers/specs/2026-03-17-api-contract-v1.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`
- `docs/superpowers/plans/2026-03-17-baseball-record-v1-backend.md`
