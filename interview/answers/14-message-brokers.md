Title: Message Brokers and Use Cases

Kafka

- Strengths: high-throughput, partitioned logs, durable ordering, stream processing.
- Use cases: event sourcing, analytics pipelines, CDC, fan-out, streaming ETL.

RabbitMQ

- Strengths: flexible routing (topics/direct), acknowledgments, work queues, dead-lettering.
- Use cases: task distribution, RPC-style async, scheduled/retry queues.

SQS/SNS (managed)

- Strengths: simplicity, serverless, cost-effective, at-least-once delivery.
- Use cases: decouple services, background jobs, fan-out via SNS->SQS.

Redis Streams

- Strengths: lightweight streaming, consumer groups, low latency.
- Use cases: small-scale eventing, ephemeral jobs, rate limiting coordination.

Recommendations

- Choose Kafka for high-scale event streams; RabbitMQ for command/work queues; SQS/SNS when managed is preferred.
