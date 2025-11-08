Title: Controlling Deployment Versions Between Non-Prod and Prod

Core practices

- Immutable artifacts: build once, promote same image/bundle across environments.
- Tagging: SemVer + git SHA; record SBOM; provenance (SLSA/attestations).
- Environment parity: same infra modules; differences via config/params only.
- Promotion workflow: dev -> stage -> prod with automated gates and approvals.
- Feature flags: decouple deploy from release; gradual rollouts by cohort.
- Drift detection: GitOps desired state; alerts on manual changes.
- Rollback: keep N previous versions; fast revert via traffic switch or helm rollback.

Tooling

- Registry (ECR/GHCR), GitOps (ArgoCD/Flux), Helm/Kustomize overlays, Terraform workspaces.
