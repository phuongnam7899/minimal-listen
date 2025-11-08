Title: Creating and Managing CI/CD Pipelines

Principles

- Trunk-based development, small PRs, fast feedback, deterministic builds, repeatable deploys.

CI (per PR and main)

- Install, lint, type-check, unit tests, coverage gates, dependency audit (SCA), secret scan.
- Build artifacts (Node: dist, Docker image), SBOM generation, cache dependencies.

CD

- Promote artifacts across envs; infra as code; database migrations gated and idempotent.
- Progressive delivery: canary/blue-green; health checks; automated rollback on SLO/regression.
- Approvals for production; change windows; release notes; feature flags.

Recommended stack

- GitHub Actions/GitLab CI; Docker + multi-stage; ArgoCD/Flux for GitOps; Helm/Kustomize.
- Testing: Playwright E2E; Pact for contract tests; k6 for load; OPA for policy.
