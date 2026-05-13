# Entry Calendar Real Month Layout Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 입력 화면의 날짜 달력을 실제 월간 달력처럼 보이게 바꾸고, 앞달/다음달 날짜 선택과 미래 날짜 비활성 규칙을 유지한다.

**Architecture:** `EntryCalendarSheet`의 날짜 셀 계산을 단순 `1..말일` 배열에서 `7열 x 6행` 셀 모델로 교체한다. 렌더링은 셀 모델을 기준으로 상태(`현재월`, `인접월`, `오늘`, `선택일`, `미래`)를 나눠 표시하고, 관련 CSS와 테스트를 함께 맞춘다.

**Tech Stack:** React, Next.js App Router, Vitest, Testing Library, CSS in `frontend/src/app/globals.css`

---

## Chunk 1: 달력 셀 모델과 테스트

### Task 1: 날짜 셀 모델 테스트 추가

**Files:**
- Modify: `frontend/src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx`

- [x] **Step 1: 시작 요일 배치 테스트 추가**

검증할 내용:
- `2026-05-01`이 금요일 위치에 보이는지
- 앞쪽에 4월 말 날짜가 같이 보이는지

- [x] **Step 2: 앞달/다음달 날짜 이동 테스트 추가**

검증할 내용:
- 예: `2026-05` 화면에서 `4/30`을 누르면 `2026-04-30` 선택
- `6/1`처럼 미래가 아닌 다음달 날짜는 선택 가능

- [x] **Step 3: 미래 날짜 disabled 테스트 추가**

검증할 내용:
- 현재 월 미래 날짜 disabled
- 다음달 미래 날짜 disabled

- [x] **Step 4: 테스트 실행**

Run:
```bash
npm run test -- src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx
```

### Task 2: 달력 셀 모델 구현

**Files:**
- Modify: `frontend/src/features/entry/components/EntryCalendarSheet.jsx`

- [x] **Step 1: 날짜 셀 빌더 함수 추가**

구현할 내용:
- `viewYear`, `viewMonth` 기준 42칸 셀 생성
- 각 셀에 `dateKey`, `day`, `isCurrentMonth`, `isFutureDate` 포함

- [x] **Step 2: 셀 클릭 규칙 구현**

구현할 내용:
- 현재 월 날짜: 바로 선택
- 인접 월 날짜: 해당 월로 이동하면서 선택
- 미래 날짜: 클릭 무시

- [x] **Step 3: 요일 헤더 추가**

구현할 내용:
- `일 월 화 수 목 금 토` 행 렌더링

- [x] **Step 4: 테스트 재실행**

Run:
```bash
npm run test -- src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx
```

## Chunk 2: 스타일과 목 확인

### Task 3: 달력 스타일 실제 달력형으로 조정

**Files:**
- Modify: `frontend/src/app/globals.css`

- [x] **Step 1: 요일 행 스타일 추가**

- [x] **Step 2: 인접 월 날짜 흐림 스타일 추가**

- [x] **Step 3: 오늘/선택일 구분 스타일 추가**

- [x] **Step 4: 6주 고정 그리드 높이 확인**

### Task 4: 입력 화면 연결 확인

**Files:**
- Check: `frontend/src/features/entry/components/EntryStepDateTime.jsx`

- [x] **Step 1: inline variant에서 새 달력 동작 확인**

- [x] **Step 2: `/games/new` 진입 시 달력 표시 확인**

## Chunk 3: 검증과 로컬 확인 흐름

### Task 5: 관련 테스트 전체 검증

**Files:**
- Test: `frontend/src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx`
- Test: `frontend/src/features/entry/components/__tests__/EntryFlowClient.test.jsx`

- [x] **Step 1: 달력 테스트 실행**

Run:
```bash
npm run test -- src/features/entry/components/__tests__/EntryCalendarSheet.test.jsx src/features/entry/components/__tests__/EntryFlowClient.test.jsx
```

- [ ] **Step 2: 회귀 없는지 홈 mock 흐름 유지 확인**

Run:
```bash
npm run test -- src/features/home/api/__tests__/home-api.test.js src/features/home/model/__tests__/home-view-model.test.js src/components/home/__tests__/HomePageClient.test.jsx src/features/auth/session/__tests__/auth-session-context.test.jsx
```

### Task 6: localhost 확인 준비

**Files:**
- Check: `frontend/src/features/auth/api/auth-api.js`
- Check: `frontend/src/features/home/api/home-api.js`

- [x] **Step 1: mock auth 모드로 프론트 실행**

Run:
```bash
NEXT_PUBLIC_ENABLE_MOCK_AUTH=true NEXT_PUBLIC_API_BASE_URL= npm run dev
```

- [x] **Step 2: `http://localhost:3000/games/new`에서 달력 확인**

- [x] **Step 3: 모바일 뷰포트에서도 6주 고정 구조 확인**

## Chunk 4: 마무리

### Task 7: 문서 일치성 재확인

**Files:**
- Check: `docs/milestone-1/screen-design.md`
- Check: `docs/milestone-1/prd.md`
- Check: `docs/milestone-1/scenario.md`
- Check: `docs/milestone-1/ASCII-LAYOUT.md`

- [x] **Step 1: 구현 결과가 문서와 어긋나지 않는지 확인**

### Task 8: 커밋

**Files:**
- Modify: 현재 브랜치 변경 전체

- [ ] **Step 1: 변경 파일 stage**

- [ ] **Step 2: 커밋**

예시:
```bash
git commit -m "feat: 입력 달력을 실제 월간 달력 구조로 정리하였습니다"
```
