# 43. API Specification

### POST /api/v1/compare
Request comparison of products based on natural language prompt.
- **Request Body:**
  ```json
  {
    "query": "best laptop for programming under $1500"
  }
  ```
- **Response Body:**
  ```json
  {
    "category": "laptops",
    "recommendations": [
      { "name": "Dell XPS 13", "rank": 1, "score": 9.4 }
    ]
  }
  ```

---
[← Previous Chapter](42_database_schema.md) | [Index](../index.md) | [Next Chapter →](44_authentication.md)
