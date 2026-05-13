# My Baseball Record Frontend

`마이베이스볼레코드` 통합 프로젝트 안의 프론트엔드 애플리케이션입니다.

현재 `frontend/`는 Next.js App Router 기반 모바일 웹 앱이며, 카카오 로그인, 홈 요약, 누적 기록, 경기 생성/조회/수정 흐름을 제공합니다.

## Repository Role

- `../docs`
  - 기획, 시나리오, 화면 기획, 구현 계획 문서
- `./`
  - 프론트엔드 애플리케이션 구현
- `../backend`
  - 백엔드 애플리케이션 구현

## Current Scope

v1 프론트엔드는 아래 흐름을 우선 구현합니다.

1. 인증 화면 진입
2. 카카오 로그인
3. 기록 확인 요약 화면 이동
4. 필요 시 상세 기록 화면 이동
5. 경기 추가
6. 경기 정보 입력
7. 타자 기록 / 투수 기록 입력
8. 저장 후 경기 상세 또는 홈 화면 복귀

## Source Documents

기준 문서는 상위 프로젝트의 `docs/` 디렉토리에 있습니다.

- Scenario
  - `../docs/milestone-1/scenario.md`
- Product Requirements
  - `../docs/milestone-1/prd.md`
- Frontend State
  - `../docs/milestone-1/2026-03-31-frontend-state-management.md`
- Frontend API Integration
  - `../docs/milestone-1/2026-03-31-frontend-api-integration-structure.md`
- Game Detail Browse Design
  - `../docs/milestone-1/2026-04-06-game-detail-browse-design.md`

## Tech Stack

- React
- JavaScript
- Next.js 15 App Router
- Vitest
- React Testing Library

## Getting Started

```bash
npm install
npm run dev
```

기본 개발 서버가 뜨면 브라우저에서 Next 앱을 확인할 수 있습니다.

로컬 API 연동은 보통 아래 값을 사용합니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

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
- 경기 입력 화면은 현재 단계형 입력과 개별 수정 흐름을 함께 가진다.
- API base URL이 없는 환경에서는 일부 인증 흐름이 mock fallback으로 동작할 수 있다.
