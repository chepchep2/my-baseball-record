# 기록 저장 후 홈 이동 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 경기 생성 완료는 경기 정보 화면에 유지하고, 내 기록 저장 완료는 홈 화면으로 이동하게 한다.

**Architecture:** 기존 matches 기록 입력 컴포넌트의 저장 성공 후 라우팅만 수정한다. 경기 생성 컴포넌트의 라우팅은 `/matches/{gameId}`를 유지하며, 저장 실패 시 현재 입력 화면에 남는다.

**Tech Stack:** Next.js, React, Vitest, Testing Library

---

### Task 1: 기록 저장 후 이동 규칙 고정

**Files:**
- Modify: `frontend/src/features/matches/components/MatchRecordCreatePageClient.jsx`
- Test: `frontend/src/features/matches/components/__tests__/MatchRecordCreatePageClient.test.jsx`

- [x] **Step 1: 저장 성공 후 홈 이동을 검증하는 실패 테스트 작성**
- [x] **Step 2: 테스트가 현재 구현에서 실패하는지 확인**
- [x] **Step 3: 저장 성공 라우팅을 `/home`으로 변경**
- [x] **Step 4: 관련 테스트와 프론트 전체 검증 실행** (테스트 87개 및 빌드 통과; 기존 린트 오류 4개 확인)
- [ ] **Step 5: 변경사항 커밋**
