# Baseball Record V1 Frontend Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Baseball Record v1 프론트엔드를 Next.js 기반 모바일 웹으로 구성해 하단 탭바 중심 구조, 누적 기록 조회, 캘린더 기반 경기 관리, 개별 경기 상세, 생성/수정 흐름을 구현한다.

**Architecture:** Next.js App Router를 기준으로 인증 화면, 홈 화면, 기록 화면, 생성 화면, 경기 화면, 개별 경기 상세 화면, 내 정보 화면을 구성한다. 수정은 생성 화면 재사용으로 처리하고, 경기 상세의 더보기 메뉴에서 수정/삭제를 제공한다.

## Scope Summary

- 인증 화면
- 홈 화면
- 기록 화면
- 생성 화면
- 경기 화면
- 개별 경기 상세 화면
- 내 정보 화면
- 삭제 확인 모달
- 하단 탭바
- 캘린더 라이브러리 도입

## Routes

- `/auth`
- `/home`
- `/records`
- `/games/new`
- `/games`
- `/games/[gameId]`
- `/account`

수정은 `/games/[gameId]/edit` 또는 생성 화면 재사용 라우트로 구현한다.

## File Structure

- Modify: `frontend/src/app/layout.jsx`
- Modify: `frontend/src/app/globals.css`
- Create: `frontend/src/app/auth/page.jsx`
- Create: `frontend/src/app/home/page.jsx`
- Create: `frontend/src/app/records/page.jsx`
- Create: `frontend/src/app/games/new/page.jsx`
- Create: `frontend/src/app/games/page.jsx`
- Create: `frontend/src/app/games/[gameId]/page.jsx`
- Create: `frontend/src/app/games/[gameId]/edit/page.jsx`
- Create: `frontend/src/app/account/page.jsx`
- Create: `frontend/src/components/navigation/BottomTabBar.jsx`
- Create: `frontend/src/components/calendar/GameCalendar.jsx`

## Chunk 1: Global Navigation

- [ ] 하단 탭바를 추가한다
- [ ] 탭 순서를 `홈 / 기록 / 생성 / 경기 / 내 정보`로 고정한다
- [ ] 수정 모드에서는 탭바를 숨긴다

## Chunk 2: Home And Records

- [ ] 홈 화면을 현재 시즌 핵심 요약 화면으로 구현한다
- [ ] 기록 화면을 누적 기록 상세 조회 화면으로 구현한다
- [ ] 기록 화면에서 `시즌/통산 + 연도 선택`, `타자/투수 + 경기 유형 선택` 구조를 구현한다

## Chunk 3: Create And Edit

- [ ] 생성 화면에 경기 정보 입력 단계와 기록 입력 단계를 구현한다
- [ ] 기록 입력은 `구성` 단위 전환으로 구현한다
- [ ] 생성 화면에서 localStorage 임시 저장과 자동 복구를 구현한다
- [ ] 생성 draft key `draft:create:{userId}`와 TTL 7일 규칙을 구현한다
- [ ] 수정 모드는 생성 화면을 재사용한다
- [ ] 수정 모드에서는 날짜와 경기 유형을 읽기 전용으로 둔다
- [ ] 수정 draft key `draft:edit:{userId}:{gameId}`와 TTL 7일 규칙을 구현한다
- [ ] 수정 모드에도 localStorage 임시 저장과 복구를 적용한다

## Chunk 4: Games Tab

- [ ] 캘린더 라이브러리를 도입한다
- [ ] 경기 화면에서 월간 캘린더를 먼저 보여준다
- [ ] 기본 진입 시 오늘 날짜를 자동 선택한다
- [ ] 날짜 셀 경기 수를 `1`, `2`, `+3` 규칙으로 표시한다
- [ ] 선택 날짜의 경기 카드 목록만 아래에 보여준다
- [ ] 빈 상태 문구 `이 날짜에 기록된 경기가 없습니다.`를 구현한다

## Chunk 5: Single-game Detail

- [ ] 개별 경기 상세 화면을 구현한다
- [ ] 저장된 입력값을 읽기 전용으로 보여준다
- [ ] 타자/투수 전환으로 현재 선택된 기록만 보여준다
- [ ] 상단 우측 더보기 메뉴에 `수정`, `삭제`를 넣는다
- [ ] 삭제 확인 모달을 구현한다
- [ ] 삭제 후 경기 탭으로 돌아가 목록과 캘린더를 갱신한다

## Chunk 6: Account

- [ ] 내 정보 화면을 구현한다
- [ ] 로그인 방식 표시와 로그아웃을 제공한다

## Chunk 7: Verification

- [ ] 모바일 화면 기준으로 홈, 기록, 생성, 경기, 개별 경기 상세를 검증한다
- [ ] 브라우저 재진입 시 복구 확인 모달을 검증한다
- [ ] build를 통과시킨다
- [ ] Vercel 배포 기준을 유지한다
