# 47. Semantic Search

- Product features and descriptions are converted to 1536-dimensional embeddings using text-embedding-3-small.
- Queries are vectorized and similarity-searched using pgvector:
  ```sql
  SELECT * FROM product_embeddings ORDER BY embedding <=> $1 LIMIT 20;
  ```

---
[← Previous Chapter](46_ai_architecture.md) | [Index](../index.md) | [Next Chapter →](48_recommendation_algorithm.md)
