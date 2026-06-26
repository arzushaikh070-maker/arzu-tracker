# 53. Caching Strategy

We use Redis for distributed caching:
- Compare results: Cached for 24 hours (key: compare:hash).
- Auto-complete: Cached in memory (key: autocomplete:prefix).
- Session data: Cached with TTL matching JWT duration.

---
[← Previous Chapter](52_data_validation.md) | [Index](../index.md) | [Next Chapter →](54_logging.md)
