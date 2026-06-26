# 46. AI Architecture

Our AI architecture separates query analysis, retrieval, and synthesis:
1. Query Analyzer parses natural language into constraints.
2. Embedding Service computes pgvector vectors for search.
3. Context Builder merges database records with user query.
4. LLM synthesis generates reasoning summaries.

---
[← Previous Chapter](45_authorization_rbac.md) | [Index](../index.md) | [Next Chapter →](47_semantic_search.md)
