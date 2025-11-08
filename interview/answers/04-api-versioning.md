Title: Managing API Versioning

Strategies

- URI-based: /v1, /v2 — simplest routing and caching; recommended for public APIs.
- Header/content negotiation: Accept: application/vnd.company.v2+json — flexible, more complex.
- SemVer for contracts: breaking change => major; additive, backward-compatible => minor.

Practices

- Backward compatibility first; additive changes preferred. Sunset policy and timelines.
- Gateways route per version; maintain at least N-1 alive during migration.
- Contract tests per consumer; schema registry for events (Avro/JSON Schema/Protobuf).
- Documentation per version (OpenAPI), changelogs, deprecation warnings in responses.

Recommendations

- Default to URI versioning for REST; header versioning for internal if needed.
- Version events via schema evolution + compatibility modes; never break old consumers silently.
