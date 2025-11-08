Title: Monitoring & Observability Metrics (App and Infra)

Application (Node.js)

- RED: request rate, error rate, duration percentiles (p50/p95/p99).
- Event loop lag, heap usage, GC, open handles, queue depths (Kafka/RabbitMQ), DB latency.
- Business KPIs (sign-ins, conversions). Structured JSON logs with trace/span IDs.

Frontend (React)

- Core Web Vitals: LCP, INP, CLS. TTFB, FID, TTI. JS errors, failed requests.
- Client-side traces for critical flows; feature usage and funnel analytics.

Infrastructure

- USE: CPU, memory, disk IO, network, container restarts, pod health, HPA scaling signals.
- Dependencies: DB health (replication lag), cache hit ratio, broker lag, CDN metrics.

Tooling & practices

- OpenTelemetry for traces/metrics/logs; Prometheus + Grafana; ELK/CloudWatch/Datadog.
- SLOs with burn-rate alerts; runbooks; synthetic checks; blackbox probes; canaries.
