# My Baseball Record Frontend

`마이베이스볼레코드` 프론트엔드 구현 저장소입니다.

현재 저장소는 React + JavaScript 기반 SPA를 구현하기 위한 프론트엔드 repo이며, 인증, 기록 확인, 경기 생성 및 기록 입력 화면을 중심으로 개발합니다.

## Repository Role

- 이 저장소: 프론트엔드 애플리케이션 구현
- 문서 저장소: `my-baseball-record-docs`
- 백엔드 저장소: `my-baseball-record-backend`

## Related Repositories

- `my-baseball-record-docs`
  - PRD, 시나리오, 화면 기획, ASCII 와이어프레임, 구현 계획 문서
- `my-baseball-record-frontend`
  - React 기반 프론트엔드 애플리케이션
- `my-baseball-record-backend`
  - Spring Boot 기반 백엔드 API

## Current Scope

v1 프론트엔드는 아래 흐름을 우선 구현합니다.

1. 인증 화면 진입
2. 로그인 또는 회원가입
3. 기록 확인 화면 이동
4. 경기 추가
5. 경기 정보 입력
6. 타자 기록 / 투수 기록 입력
7. 저장 후 기록 확인 화면 복귀

## Source Documents

기준 문서는 `my-baseball-record-docs` repo에 있습니다.

- Scenario
  - `my-baseball-record-docs/docs/superpowers/specs/2026-03-17-scenario-v1.md`
- Screen Planning
  - `my-baseball-record-docs/docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- Frontend Plan
  - `my-baseball-record-docs/docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`
- Frontend ASCII Wireframes
  - `my-baseball-record-docs/docs/superpowers/specs/2026-03-17-frontend-ascii-wireframes.md`

## Tech Stack

- React
- JavaScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod
- Vitest
- React Testing Library

## Getting Started

```bash
npm install
npm run dev
```

기본 개발 서버가 뜨면 브라우저에서 Vite 앱을 확인할 수 있습니다.

## Branch Strategy

- `main`
  - 초기 기준점과 안정적인 상태를 보관
- `develop`
  - 통합 개발 브랜치
- `feat/<feature-name>`
  - 기능 단위 작업 브랜치

예:

- `feat/frontend-bootstrap`
- `feat/auth-screen`
- `feat/records-page`

## Notes

- 기본 진입 화면은 인증 화면이다.
- 로그인 후 기록 확인 화면이 메인 허브 역할을 한다.
- 경기 입력 화면은 `타자 -> 투수` 강제 위저드가 아니라 `타자 기록 / 투수 기록` 탭 전환형이다.
- 최근 경기 전용 화면은 현재 v1 범위 밖이다.
