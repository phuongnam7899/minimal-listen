Title: Ensuring High Availability (HA)

Strategies

- Redundancy: multi-AZ (and multi-region if needed); stateless services with autoscaling.
- Health and failover: readiness/liveness probes; load balancers; graceful shutdown.
- State: managed databases with replicas; failover tested; RPO/RTO targets; backups + PITR.
- Caching/CDN: reduce origin load; regional caches; circuit breakers to degrade gracefully.
- Dependencies: timeouts/retries with jitter; bulkheads; backpressure; queues for burst absorption.
- DR: runbooks, game days, chaos testing; infrastructure-as-code for rapid rebuild.

Observability

- SLOs and burn rates; synthetic checks; alert on symptoms, not just causes.
