Title: Designing Distributed Systems & Microservices

Key factors

- Cohesion and coupling: services align to bounded contexts; avoid shared databases.
- Contracts: API-first, versioning, backward-compatible changes, consumer-driven contracts.
- Data ownership: one writer per dataset; propagate via events; avoid distributed joins.
- Transactions: use sagas and outbox pattern; idempotency keys; exactly-once illusions avoided.
- Communication: sync (gRPC/HTTP) for request-response; async (Kafka/RabbitMQ) for events/work.
- Resilience: timeouts, retries with jitter, circuit breakers, bulkheads, backpressure.
- Discovery/config: service discovery, config management, feature flags.
- Security: zero-trust (mTLS), per-service identities, fine-grained RBAC, least privilege.
- Observability: trace across boundaries (W3C tracecontext), RED/USE metrics, structured logs.
- Deployment: containers, independent versioning, progressive rollouts, rollbacks.

Tech choices

- Node.js with Nest/Fastify; Postgres per service; Redis for cache; Kafka for events.
- API Gateway/Ingress for north-south; service mesh (Istio/Linkerd) for east-west if needed.

Anti-patterns to avoid

- Shared DB schemas; chatty sync calls in critical paths; distributed transactions with 2PC.
- Inconsistent IDs/correlation; lack of idempotency; missing DLQs; no schema evolution.

Transactions in distributed systems (practical guidance)

- Consistency model
  - Prefer eventual consistency across services; keep ACID within a single service’s database.
  - Avoid 2PC; coordinate with domain events and compensating actions instead.
- Sagas
  - Orchestration: a central saga orchestrator invokes steps and compensations (easier observability).
  - Choreography: services react to events and emit follow-ups (reduced coupling to a central brain).
  - Always define compensations for side effects (refund, release inventory, revert status).
- Transactional messaging
  - Outbox pattern: write domain change and event in same DB transaction; async relay publishes.
  - Inbox/Idempotent consumer: dedupe received messages via processed-message store.
- Idempotency
  - Idempotency keys/correlation IDs per command; PUT/UPSERT over PATCH where possible.
  - Make handlers safe to retry; ensure external calls (payments, emails) are deduplicated.
- Reliability controls
  - Timeouts, bounded retries with jittered backoff; DLQs for poison messages and replay tools.
  - Ordering: design for per-aggregate ordering (keyed partitions) rather than global ordering.
- Patterns
  - TCC (Try-Confirm/Cancel) for reserving scarce resources (payments, inventory).
  - Out-of-band reconciliation jobs to close eventual consistency gaps and handle stragglers.
- Observability
  - Correlate with trace IDs across services; emit saga state transitions and step latency.
  - Define SLOs on end-to-end completion time and compensation rates.

Outbox pattern (deep dive)

- Why
  - Guarantee that domain state changes and their corresponding integration events are atomic from the service’s perspective.
  - Avoid dual-write problems when updating DB and publishing to a broker.
- How it works
  - In the same DB transaction that persists the domain change, insert a row into an `outbox` table with event payload and metadata.
  - After commit, a background relay reads new outbox rows and publishes them to the message broker, then marks them as sent.
- Table design
  - Columns: `id (uuid)`, `aggregate_type`, `aggregate_id`, `type`, `payload (jsonb)`, `occurred_at`, `status`, `attempts`, `trace_id`, `order_key`.
  - Index by `status, occurred_at` for scanning and by `order_key` if you need per-aggregate ordering.
- Relay/publisher
  - Polling with backoff or DB notifications (e.g., Postgres LISTEN/NOTIFY) to reduce latency.
  - Publish with idempotent keys (use `id`) so consumers/brokers dedupe on retries.
  - Update `status` to SENT within a transaction; record `published_at` and broker offset if needed.
- Idempotency and ordering
  - Consumers store a processed-message `id` to ensure at-least-once delivery doesn’t double-apply.
  - Partition by `order_key` (e.g., aggregate id) to preserve per-entity order in Kafka.
- Failure modes
  - Relay crash: safe to retry; unsent rows remain PENDING.
  - Broker outage: exponential backoff, DLQ after N attempts, alerts on backlog size/age.
  - Poison events: validate payload schema; send to DLQ with reason; keep replay tooling.
- Exactly-once caveat
  - Aim for “exactly-once effects” via idempotent producers/consumers, not magical delivery semantics.
- Node.js/Postgres tips
  - Use a single DB transaction scope for domain write + outbox insert (e.g., `pg` with `BEGIN/COMMIT`).
  - Use `jsonb` payload with a versioned schema; validate before publishing.
  - Consider logical decoding + Debezium as an alternative to a custom relay when using Kafka.
- Operations
  - Monitor outbox backlog count, oldest event age, relay publish latency, and DLQ rates.
  - Periodically archive SENT rows to keep the table small; use partitioning if volume is high.
