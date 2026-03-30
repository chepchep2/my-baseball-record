# Backend AGENTS

## Purpose

이 폴더의 백엔드는 `작은 범위`, `강한 계약`, `테스트 우선`을 기본 원칙으로 한다.
한 번에 큰 기능을 밀어 넣기보다, API 한 개와 도메인 규칙 한 묶음을 정확하게 완성하는 방식을 따른다.

이 프로젝트의 백엔드는 특히 아래를 기준으로 작업한다.

- API 계약 문서와 실제 구현이 어긋나지 않는가
- 검증 규칙과 계산 규칙이 테스트로 고정되어 있는가
- create/update/delete/stats 책임이 섞이지 않는가
- 원자적 저장과 불변 필드 규칙이 일관되게 유지되는가

## Architecture Principles

- Spring Boot + Java 기준으로 계층을 명확히 분리한다.
- controller는 HTTP 입출력과 validation error mapping에 집중한다.
- service는 유스케이스 단위를 담당한다.
- domain은 규칙과 계산의 중심이 된다.
- repository는 저장소 접근을 담당한다.
- 통계 계산 로직은 별도 calculator/service로 분리한다.

## Domain Rules

- 인증, 경기 관리, 누적 기록 계산을 분리한다.
- 경기 저장은 원자적으로 처리한다.
- 부분 저장은 지원하지 않는다.
- 생성에서는 `playedAt`, `seasonYear`, `gameType`을 함께 결정한다.
- 수정에서는 `playedAt`, `seasonYear`, `gameType`을 변경할 수 없다.
- 개별 경기 상세와 누적 기록 조회는 서로 다른 응답 책임을 가진다.

## API Contract Rules

- API는 반드시 문서 계약을 기준으로 구현한다.
- 응답 shape를 구현 편의로 임의 변경하지 않는다.
- `POST /api/games`, `PUT /api/games/{id}`는 개별 경기 상세 응답 전체를 반환한다.
- 에러는 공통 error envelope를 유지한다.
- 날짜별 경기 목록은 정렬 규칙을 고정한다.

## TDD Rules

- 새로운 기능 구현은 테스트부터 시작한다.
- 최소 단위는 controller보다 domain/service 규칙 검증을 우선한다.
- 아래 규칙은 테스트 없이 구현하지 않는다.
  - 숫자 입력 검증
  - 계산 규칙
  - 수정 불가 필드
  - 삭제 후 조회 결과 변화
  - stats summary/details 계산
- 버그 수정은 먼저 재현 테스트를 추가한 뒤 수정한다.

## Validation Rules

- 잘못된 숫자 입력을 필드 단위로 식별 가능해야 한다.
- 미래 날짜, 불가능한 조합, 음수 입력을 일관되게 막는다.
- 타자/투수 레코드가 일부만 들어온 경우에도 유효성 규칙을 명확히 적용한다.
- 프론트 검증이 있더라도 백엔드 검증을 생략하지 않는다.

## Refactoring Rules

- 테스트 없는 리팩토링은 하지 않는다.
- 큰 구조 변경보다 API 한 개씩 정리한다.
- 중복 로직은 service/util로 모으되, 도메인 규칙이 흐려지지 않게 한다.
- persistence 구조 변경 시 기존 계약과 테스트를 먼저 확인한다.

## Delivery Rules

- API는 한 개씩 접근한다.
- 각 API는 request/response/error까지 묶어서 완성한다.
- PR 단위는 작게 유지한다.
- 구현 완료 후에는 코드 리뷰 관점에서 다시 읽을 수 있어야 한다.

## Documentation Rules

- 백엔드 기능 브랜치는 가능하면 아래 3문서를 함께 관리한다.
  - 설계 문서
  - 구현 계획 문서
  - 리뷰/검증 가이드 문서
- 설계 문서는 계약과 도메인 규칙을 고정하는 용도로 사용한다.
- 구현 계획 문서는 테스트 순서와 작업 단위를 고정하는 용도로 사용한다.
- 리뷰/검증 가이드는 사람이 직접 확인할 수 있게 작성한다.
- 리뷰/검증 가이드에는 최소 아래 항목을 포함한다.
  - 대상 API와 리뷰 범위
  - 확인할 파일 경로
  - APIdog 또는 동등한 도구로 검증할 요청 예시
  - 필요한 header, cookie, body 예시
  - 기대 응답과 실패 응답
- 리뷰/검증 가이드는 가능하면 브랜치 단위로 분리해 관리한다.

## Suggested Working Style

- 기능 단위로 `writing-plans`를 먼저 만든다.
- 구현은 `test-driven-development` 기준으로 진행한다.
- 완료 후에는 코드 리뷰 가이드 기준으로 다시 점검한다.
