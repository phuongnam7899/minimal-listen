Title: Managing RBAC in CI/CD Pipelines

Principles

- Least privilege: restrict by action, repo, environment, and time (just-in-time).
- Separation of duties: different roles for author, reviewer, releaser, operator.
- Traceability: every action tied to identity; approvals recorded.

Implementation

- Source control: code owners, protected branches, required reviews and checks.
- CI: runner permissions scoped per repo; ephemeral runners for secrets isolation.
- CD: environment-level RBAC (dev/stage/prod), manual approvals for prod.
- Secrets: per-env KMS; scoped OIDC workload identity for cloud access; avoid long-lived keys.
- Policy-as-code: OPA/Conftest to validate infra changes; allow/deny lists.
- Auditing: immutable logs of deployments, who approved, what changed.

Roles (example)

- Developer: commit, PR; can deploy to dev.
- Reviewer: approve PRs; can deploy to stage.
- Release manager/SRE: approve prod; execute rollbacks.
