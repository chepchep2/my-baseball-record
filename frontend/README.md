# My Baseball Record Frontend

`마이베이스볼레코드` 통합 프로젝트 안의 프론트엔드 애플리케이션입니다.

현재 `frontend/`는 React + JavaScript 기반 SPA를 구현하며, 인증, 기록 확인 요약, 상세 기록, 경기 생성 및 기록 입력 화면을 중심으로 개발합니다.

## Repository Role

- `../docs`
  - 기획, 시나리오, 화면 기획, 구현 계획 문서
- `./`
  - 프론트엔드 애플리케이션 구현
- `../backend`
  - 백엔드 애플리케이션 예정 위치

## Current Scope

v1 프론트엔드는 아래 흐름을 우선 구현합니다.

1. 인증 화면 진입
2. Google 로그인
3. 기록 확인 요약 화면 이동
4. 필요 시 상세 기록 화면 이동
5. 경기 추가
6. 경기 정보 입력
7. 타자 기록 / 투수 기록 입력
8. 저장 후 기록 확인 요약 화면 복귀

## Source Documents

기준 문서는 상위 프로젝트의 `docs/` 디렉토리에 있습니다.

- Scenario
  - `../docs/superpowers/specs/2026-03-17-scenario-v1.md`
- Screen Planning
  - `../docs/superpowers/specs/2026-03-17-screen-planning-v1.md`
- Frontend Plan
  - `../docs/superpowers/plans/2026-03-17-baseball-record-v1-frontend.md`
- Frontend ASCII Wireframes
  - `../docs/superpowers/specs/2026-03-17-frontend-ascii-wireframes.md`

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
- 로그인 후 기록 확인 요약 화면이 메인 허브 역할을 한다.
- 경기 입력 화면은 `타자 -> 투수` 강제 위저드가 아니라 `타자 기록 / 투수 기록` 탭 전환형이다.
- 최근 경기 전용 화면은 현재 v1 범위 밖이다.
