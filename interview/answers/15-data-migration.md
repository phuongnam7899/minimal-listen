Title: Designing a Data Migration System

Steps

1. Discover: schema inventory, volumes, data quality, dependencies, SLAs, blackout windows.
2. Plan: online vs offline, downtime budget, consistency model, backfill strategy.
3. Build: idempotent migration jobs; checkpointing; throttling; observability.
4. Verify: sampling, checksums, dual-read comparisons, business invariants.
5. Cutover: dual-write, read switch via feature flag; monitor; rollback plan.
6. Decommission: remove dual-writes, drop old paths, archive.

Patterns

- CDC + backfill for large tables; outbox for dual-write safety; chunked pagination.
- Blue/green databases or shadow tables for verification.

Risks & mitigations

- Data drift: freeze writes or dual-write; capture late events; reconcile jobs.
- Performance impact: throttle; off-peak runs; index carefully.
- Type/encoding issues: strict validation; contract tests; end-to-end dry runs in stage.
