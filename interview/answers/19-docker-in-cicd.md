Title: Using Docker in CI/CD

CI

- Build once per commit; cache layers; tag with git SHA + SemVer; generate SBOM and attestations.
- Scan images for vulns and secrets; fail on critical findings.

CD

- Push to registry; promote same image across envs; GitOps to deploy with Helm/Kustomize.
- Health checks, readiness probes; progressive rollout (canary/blue-green); automated rollback.

Best practices

- Immutable images; parameterize config via env and secrets; avoid embedding configs.
- Ephemeral runners; least-privileged registry and cluster credentials (OIDC).
