Title: System Design Steps After Receiving Requirements

1. Clarify and constrain

- Stakeholders, goals, non-goals, success metrics; SLAs/SLOs; compliance; data residency.
- Workload profile: read/write mix, latency/throughput, peak/seasonality, multi-tenancy.

2. Decompose domains and define boundaries

- Event storming to derive bounded contexts. Define services, ownership, and data domains.
- Pick integration styles per interaction: sync (HTTP/gRPC) vs async (events/queues).

3. Design contracts and data

- API-first with OpenAPI/AsyncAPI. Versioning strategy. Idempotency and pagination.
- Data models, indexes, partitioning, caching layers, search, analytics feeds.

4. Non-functionals and resilience

- Consistency model, transactions (saga/outbox), retries/backoff, timeouts, circuit breakers.
- Security: authn/z (OIDC/OAuth2), encryption, secrets, audit logging, least privilege.

5. Capacity planning and scaling

- Stateless services, autoscaling signals, rate limiting, backpressure, multi-region strategy.
- Storage sizing, growth, backups, RPO/RTO, disaster recovery, HA targets.

6. Technology choices

- Node.js (Express/Fastify/Nest). React/Next for web. Postgres + Redis + Kafka/RabbitMQ.
- Infra: containers, Kubernetes (or serverless), IaC (Terraform), GitOps.

7. Operability and delivery

- Observability (OTel metrics/traces/logs), dashboards, SLOs, runbooks, on-call.
- CI/CD: build, test, scan, SBOM, artifacts, progressive delivery (canary/blue-green).

8. Execution plan

- Risks and spikes, milestones, staffing, cost model. ADRs and architecture review.

Artifacts to produce

- Context/container/component diagrams, sequence diagrams, OpenAPI, ERD, SLOs, ADRs, runbooks.
