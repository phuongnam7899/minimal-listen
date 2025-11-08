Title: How I Use Docker

Development

- Dev containers (VS Code) for consistent tooling; docker-compose for local stack (DB, cache, broker).
- Hot-reload mounts for Node/React; .dockerignore to shrink build context.

Images

- Multi-stage builds (builder + runtime). Distroless or alpine for small attack surface.
- Non-root users; healthchecks; labels with vcs-ref and build date.

Security & performance

- Scan images (Trivy/Grype); pin base image digests; minimize layers; build cache.

Operations

- Config via env/secret mounts; read-only FS; resource limits; logs to stdout in JSON.
