# Docs Hub

현재 배포 기준 문서 허브다.

이 저장소의 기준 배포 브랜치는 `main`이며, 이 문서들은 2026-06-10 시점의 `main`과 공개 배포 상태를 기준으로 정리한다.

## Start Here

1. 현재 구조 인덱스
- [2026-03-31-current-docs-index.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-current-docs-index.md)

2. 제품 요구와 시나리오
- [prd.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/prd.md)
- [scenario.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/scenario.md)

3. 현재 운영 구조
- [2026-03-31-domain-deployment-structure.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-domain-deployment-structure.md)
- [2026-06-11-ci-cd-and-branch-protection-runbook.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-06-11-ci-cd-and-branch-protection-runbook.md)
- [2026-03-31-current-erd.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-current-erd.md)
- [2026-03-31-backend-api-structure.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-backend-api-structure.md)

4. 프론트 연결 구조
- [2026-03-31-frontend-state-management.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-frontend-state-management.md)
- [2026-03-31-frontend-api-integration-structure.md](/Users/chosangwoo/dev/projects/my-baseball-record/docs/milestone-1/2026-03-31-frontend-api-integration-structure.md)

## Notes

- `docs/archive/`는 이전 설계와 폐기된 문서를 보관한다.
- `docs/milestone-1/`가 현재 제품과 가장 가까운 활성 문서 묶음이다.
- 구현과 문서가 충돌하면 우선 `main`과 실제 배포 상태를 확인한 뒤 문서를 갱신한다.
- 현재 운영 자동화 기준:
  - PR to `develop` / `main`: GitHub Actions `PR Check`
  - push to `main` with backend changes: GitHub Actions `Backend Deploy`
  - push to `main`: Vercel 프론트 자동 배포
