# Documentation Hub

`마이베이스볼레코드` 문서 허브입니다.

이 디렉터리의 문서는 `개인 선수 전용 모바일 웹 기록 관리 서비스`라는 기준 아래에서 읽고 관리합니다.
문서의 목적은 제품 방향, 사용자 흐름, 설계, 구현 계획을 한 기준으로 연결하는 데 있습니다.

## Current Product Direction

- 제품 유형: 개인 선수 전용 모바일 웹 기록 관리 서비스
- 핵심 문제: 흩어진 기록을 한곳에 모아 시즌 성적을 쉽게 확인하기 어렵다
- 핵심 가치: 내 야구 기록을 계속 모으고 관리할 수 있다
- 기본 진입 경험: 홈 화면
- 재방문 트리거: 경기 후 기록 추가
- 우선 판단 기준: 입력 속도보다 기록 관리의 명확성

## Reading Order

문서를 처음 읽는 경우 아래 순서로 읽는 것을 기준으로 한다.

1. [PRD](./prd.md)
2. [Scenario V1](./superpowers/specs/2026-03-17-scenario-v1.md)
3. [Baseball Record V1 Design](./superpowers/specs/2026-03-16-baseball-record-v1-design.md)
4. [Screen Planning V1](./superpowers/specs/2026-03-17-screen-planning-v1.md)
5. [Frontend ASCII Wireframes](./superpowers/specs/2026-03-17-frontend-ascii-wireframes.md)
6. [API Contract](./superpowers/specs/2026-03-17-api-contract-v1.md)
7. [Overview Plan](./superpowers/plans/2026-03-17-baseball-record-v1-overview.md)
8. [Frontend Plan](./superpowers/plans/2026-03-17-baseball-record-v1-frontend.md)
9. [Backend Plan](./superpowers/plans/2026-03-17-baseball-record-v1-backend.md)

## Document Authority

문서 간 내용이 충돌하면 아래 순서로 우선한다.

1. [docs/prd.md](./prd.md)
2. 시나리오 문서
3. 설계 문서
4. 전체 구현 개요 문서
5. 프론트엔드/백엔드 상세 구현 계획 문서

즉 하위 문서는 상위 문서와 충돌하는 범위, 사용자 정의, 플랫폼 원칙, 기능 범위를 새로 만들 수 없다.

## Document Roles

### 1. Product Scope

- [docs/prd.md](./prd.md)

이 문서는 제품 범위의 단일 기준 문서다.
아래 내용을 이 문서가 소유한다.

- 문제 정의
- 대상 사용자
- 핵심 가치
- 포함 범위
- 제외 범위
- 모바일 웹 원칙
- 성공 기준

### 2. Scenario

- [2026-03-17-scenario-v1.md](./superpowers/specs/2026-03-17-scenario-v1.md)

이 문서는 대표 사용자가 어떤 상황에서 서비스를 열고,
어떤 흐름으로 핵심 가치를 느끼는지 설명한다.
제품 범위를 새로 정의하지 않는다.

### 3. Product Design

- [2026-03-16-baseball-record-v1-design.md](./superpowers/specs/2026-03-16-baseball-record-v1-design.md)
- [2026-03-17-screen-planning-v1.md](./superpowers/specs/2026-03-17-screen-planning-v1.md)
- [2026-03-17-frontend-ascii-wireframes.md](./superpowers/specs/2026-03-17-frontend-ascii-wireframes.md)

이 문서군은 모바일 웹 기준의 정보구조, 화면 목적, 상태, 입력 흐름, 조회 구조를 설명한다.
제품 범위는 PRD를 따른다.

### 4. Implementation Plans

향후 아래 문서들이 추가되거나 재작성된다.

- 프론트엔드와 백엔드를 함께 설명하는 구현 개요 문서
- 프론트엔드 상세 구현 계획 문서
- 백엔드 상세 구현 계획 문서

이 문서들은 상위 문서를 구현 단위로 분해하는 역할만 한다.
제품 범위를 새로 정의하지 않는다.

## Current Cleanup Direction

현재 문서 개편 작업의 핵심 방향은 아래와 같다.

- 데스크톱 기준 문서를 모바일 웹 기준으로 전환
- 개인 선수 전용 범위를 문서 전반에 명시
- 하단 탭바 중심 구조로 재정렬
- 홈 / 기록 / 생성 / 경기 / 내 정보 구조 반영
- 개별 경기 상세와 수정/삭제 흐름을 v1 범위에 포함

## Notes

- 루트 [README.md](../README.md)는 저장소 소개와 구조 설명만 담당한다.
- 자세한 문서 읽기와 문서 역할 설명은 이 `docs/README.md`를 기준으로 한다.
- `2026-03-17-mobile-web-docs-redesign-design.md`는 이전 문서 재정렬 메모이며, 현재 읽기 순서의 기준 문서는 아니다.
