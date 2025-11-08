Title: Flow to Develop a CI/CD Pipeline

1. Goals and constraints

- Target platforms, environments, approvals, compliance, DORA targets, SLAs.

2. Design pipeline

- Stages: checkout → build → test → scan → package → publish → deploy.
- Artifacts, caching strategy, matrix builds, parallelization, secrets management.

3. Implement CI

- Lint, type-check, unit/integration tests, coverage thresholds, SBOM, SCA, image build.

4. Implement CD

- Env promotion, infra-as-code, Helm/Kustomize, progressive delivery, rollback.

5. Observability and policy

- Pipeline metrics, flake tracking, cost; OPA policies; audit logs.

6. Hardening and maintenance

- Ephemeral runners, OIDC, least privilege, vulnerability management, reusable workflows.
