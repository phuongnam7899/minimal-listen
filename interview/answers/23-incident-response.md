Title: Steps When the System Suddenly Crashes

Immediate actions

- Declare incident; assign roles (commander, comms, scribe, ops). Halt risky deploys.
- Triage: user impact, scope, severity. Post status page update if needed.

Stabilize

- Roll back recent changes; scale up if resource exhaustion; enable feature kill switches.
- Use runbooks: service restarts, failover to standby/previous version.

Diagnose

- Check dashboards and alerts (SLOs, errors, saturation). Examine logs/traces for hotspots.
- Compare before/after metrics; review recent deploys, infra changes, secrets/keys rotation.

Recover

- Validate service health; confirm user paths; monitor for regression. Close incident.

Follow-up

- Blameless postmortem: timeline, root causes, contributing factors, user impact.
- Action items: fixes, tests, alerts, docs, game-day scenarios; owners and due dates.
