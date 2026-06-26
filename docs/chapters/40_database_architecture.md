# 40. Database Architecture

We use PostgreSQL as the primary transactional database, with pgvector enabled for high-dimensional embedding lookups. High-volume read targets (reviews, price history) are served via read replicas.

---
[← Previous Chapter](39_reporting.md) | [Index](../index.md) | [Next Chapter →](41_er_diagrams.md)
