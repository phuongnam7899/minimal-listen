Title: A Hard Use Case and How It Was Resolved

Context

- Multi-tenant, real-time notifications and activity feeds with strict isolation and bursty traffic.

Problems

- Hot partitions on popular tenants, out-of-order events, duplicate deliveries, fanout spikes.

Solution

- Event model: append-only events in Kafka; tenant-partitioning + hash sharding for hotspots.
- Idempotency: delivery keys; dedupe store in Redis with TTL; exactly-once illusion via at-least-once.
- Fanout: materialized per-tenant feeds built by consumers; backpressure with consumer groups.
- API: pagination via cursor; consistent reads from materialized views; retry-safe endpoints.
- Autoscaling: HPA on lag/latency; circuit breakers; rate limits per tenant.
- Observability: per-tenant SLOs, lag dashboards, DLQs + replay tools.

Impact

- 99.95% availability, p95 < 200ms, cost reduced via right-sizing and caching.
