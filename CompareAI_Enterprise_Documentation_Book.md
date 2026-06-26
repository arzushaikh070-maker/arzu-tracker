# CompareAI

## Tagline
Describe your requirements. AI finds the best option.

---
**Enterprise Engineering Documentation Book**
**Version:** 1.0.0 (Confidential)
**Date:** June 2026
**Classification:** Internal Use Only
**Author:** CompareAI Engineering & Design Group
---

This document outlines the architectural patterns, design specifications, and implementation steps required to build the CompareAI comparison platform.



---



# 2. Version History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0.0 | 2026-06-26 | Engineering Team | Initial release — all 83 chapters complete |
| 0.9.0 | 2026-06-15 | Product Manager | Internal review draft — all chapters |
| 0.8.0 | 2026-05-30 | Solution Architect | Architecture chapters added |
| 0.5.0 | 2026-04-01 | Product Manager | First complete outline |



---



# 3. Table of Contents

Please refer to the index file or the compiled PDF/Word TOC structure for a list of all 83 chapters. Every section in this documentation follows modular routing guidelines.



---



# 4. Executive Summary

CompareAI is an AI-powered universal comparison and decision platform designed to eliminate decision paralysis across every consumer and enterprise vertical. Users describe their requirements in natural language; CompareAI understands intent, retrieves structured data from authoritative sources, aggregates trusted reviews, ranks alternatives, and returns explainable, confidence-scored recommendations in seconds.

The platform operates across virtually any category: consumer electronics, software tools, AI models, cloud providers, financial products, educational programs, SaaS platforms, healthcare services, and unlimited future categories powered by a dynamic attribute schema.



---



# 5. Product Vision

CompareAI's vision is to become the world's universal AI decision layer — the place humans and systems go when they need to choose between alternatives with confidence.

### North Star
"Any person, any category, any device — understand what they need, find the best option, explain why, in under 10 seconds."

### Three-Year Vision
- **Year 1:** Launch with 10 categories, 1M products, 50M reviews indexed, 100K MAU.
- **Year 2:** Expand to 50 categories, real-time price tracking, browser extension, mobile apps, 1M MAU.
- **Year 3:** Enterprise APIs, white-label platform, 500+ category support, 10M MAU, profitability.



---



# 6. Business Goals

### Primary Goals
- Launch MVP with 10 categories live in Q2 2025.
- Reach 10,000 monthly active users (MAU) within 6 months.
- Generate $100K Annual Recurring Revenue (ARR) through Pro subscriptions by Q4 2025.
- Grow to 100K MAU and launch Enterprise Beta by Q2 2026.

### Revenue Model Detail
- **Free Tier:** 10 comparisons/month, 3 categories, basic AI, no saved data.
- **Pro ($12/mo):** Unlimited comparisons, all categories, full AI, price alerts, wishlists, history.
- **Team ($49/mo per 5 seats):** Shared workspaces, collaborative comparisons, exports.
- **Enterprise (custom):** SSO, API access, white-label, SLA, dedicated support.



---



# 7. Problem Statement

Modern buyers face comparison overload. The average consumer visits 4-7 websites and spends 3-8 hours researching a mid-complexity purchase. Enterprise buyers spend weeks in spreadsheet-driven evaluations that surface incomplete, biased, or outdated information. Existing comparison tools are category-siloed, ad-supported, and incapable of natural language interaction.



---



# 8. Success Metrics

| Metric | Target (6mo) | Target (12mo) | Measurement |
|---|---|---|---|
| Monthly Active Users | 10,000 | 100,000 | Mixpanel / PostHog |
| Search-to-Comparison Rate | >70% | >80% | Event tracking |
| AI Recommendation Satisfaction | >4.0/5.0 | >4.3/5.0 | In-app rating widget |
| Free-to-Pro Conversion | >5% | >8% | Stripe analytics |
| Pro Churn Rate | <5%/mo | <3%/mo | Stripe |
| P99 Response Time | <3s | <2s | Datadog APM |



---



# 9. Scope

### MVP Scope (v1.0)
- 10 initial categories: Laptops, Smartphones, Headphones, Cloud Storage, Project Management SaaS, AI Writing Tools, Credit Cards, Online Learning Platforms, Mechanical Keyboards, Standing Desks.
- Natural language search with intent and entity extraction.
- AI-powered comparison cards with ranked results (top 5 per query).
- Review aggregation from 5+ sources per category.
- User accounts: Google OAuth and email/password.
- Freemium tier with 10 comparisons/month limit.



---



# 10. Out of Scope

The following are explicitly excluded from the current product scope to maintain focus:
- Direct e-commerce purchasing or affiliate checkout flows in v1.0.
- Real-time inventory availability across retailers.
- User-generated product submissions without admin review in v1.0.
- Video content hosting or streaming.
- Social networking or follower mechanics.



---



# 11. Personas

### Persona 1: Maya, 31, Marketing Manager (Austin, TX)
- **Goal:** Buy a noise-cancelling headphone under $300 for WFH and commuting.
- **Pain:** Spent 4 hours reading Reddit and Wirecutter; still unsure.
- **Quote:** "Just tell me what to buy and why. I don't have time to become an audiophile."

### Persona 2: Daniel, 38, Engineering Manager (London)
- **Goal:** Evaluate 3 cloud providers for a new microservices workload: cost, latency, compliance.
- **Pain:** Comparison spreadsheets take days; pricing calculators are incomparable.



---



# 12. User Journeys

### Consumer Product Purchase Journey
1. User lands on CompareAI homepage and types: "best laptop for video editing under $2000 with good battery life".
2. System detects intent: PRODUCT_SEARCH; category: LAPTOPS; extracts constraints: budget=$2000, use_case=video_editing, priority=battery_life.
3. Semantic search retrieves top 20 candidates from product graph.
4. Ranking engine scores on matched attributes, review scores, price-value ratio.
5. Top 5 results render as animated comparison cards with confidence indicators.



---



# 13. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-001 | Free user | Type my requirements in plain English | I don't have to learn a filter UI |
| US-002 | Free user | See ranked comparison results in <10 seconds | I can make quick decisions |
| US-003 | Free user | See why AI ranked each option | I trust the recommendation |
| US-004 | Pro user | Save comparisons to a wishlist | I can revisit them later |
| US-005 | Pro user | Set price drop alerts | I buy at the right time |



---



# 14. Functional Requirements

### Search System (FR-SRCH)
- **FR-SRCH-001:** System shall accept natural language query of 1–500 characters.
- **FR-SRCH-002:** System shall detect primary intent from query.
- **FR-SRCH-003:** System shall extract entities: category, budget, brand preferences, use cases.
- **FR-SRCH-004:** System shall return minimum 3 and maximum 10 ranked results per query.
- **FR-SRCH-005:** System shall complete search in <3 seconds P95.



---



# 15. Non-functional Requirements

### Performance
- **NFR-PERF-001:** Search response time P50 shall be <1.0s for cached queries.
- **NFR-PERF-002:** Search response time P95 shall be <3.0s for cold queries with live AI inference.
- **NFR-PERF-003:** Page load (LCP) shall be <2.5s on a 3G mobile device.

### Reliability
- **NFR-REL-001:** System uptime shall be 99.9% monthly SLA for Pro users.



---



# 16. Information Architecture

### Site Map
The CompareAI information architecture is organized into five primary zones:
- **Public Zone:** /, /categories, /compare/[slug], /pricing, /about
- **Auth Zone:** /login, /register, /forgot-password
- **User Zone:** /dashboard, /history, /wishlists, /settings
- **Admin Zone:** /admin/overview, /admin/products, /admin/categories
- **API Zone:** /api/v1/*



---



# 17. Navigation Structure

### Primary Navigation (Desktop)
Sticky top navbar with glass effect background:
- Logo mark (animated SVG) -> /
- Categories dropdown (mega menu with category tiles)
- Pricing -> /pricing
- Search bar (Command Palette activation via Cmd+K)
- User avatar dropdown (Dashboard, Wishlists, Settings, Sign Out)



---



# 18. UX Principles

- **Query-First:** Users lead with natural language, never form fields.
- **Instant Feedback:** Skeleton loaders appear within 100ms; AI streams tokens.
- **Transparent AI:** Show evidence, confidence, and reasoning for every rank.
- **Progressive Disclosure:** Summary first; expand for deep-dive attribute details.



---



# 19. UI Design System

### Design System Tokens
We use a premium visual identity characterized by glassmorphism, high contrast, clean typography, and spacious layouts.

```json
{
  "color": {
    "brand-primary": "#1A56DB",
    "brand-accent": "#7C3AED",
    "surface-glass": "rgba(255,255,255,0.08)",
    "border-glass": "rgba(255,255,255,0.12)"
  }
}
```



---



# 20. 3D Experience Design

### Philosophy
3D effects serve communication, not decoration. 3D elements communicate state, provide delight, and aid user orientation.

### Hero Section Orb
The landing page hero features a rotating AI hologram orb built with React Three Fiber:
- Material: MeshDistortMaterial (metalness 0.9, roughness 0.1, distort 0.35, speed 2).
- Performance boundary: disable WebGL on devices with <4GB RAM.



---



# 21. Motion Design Guidelines

### Timing Scale
- **motion-fast (150ms):** Button press, checkboxes, toggles.
- **motion-base (250ms):** Card hover, menu slide-in, tooltips.
- **motion-slow (400ms):** Page transitions, modal entering.

### Easing Tokens
Use spring-based physics curves for natural tactility:
- Stiffness: 300, Damping: 20.



---



# 22. Accessibility Standards

CompareAI targets WCAG 2.1 Level AA compliance.
- **Contrast:** Minimum 4.5:1 ratio for normal body text.
- **Keyboard Navigation:** Tab index follows logical visual layout order.
- **Focus Rings:** 3px solid #1A56DB with 2px offset.
- **Screen Readers:** Custom aria-labels for all interactive icon buttons.



---



# 23. Responsive Design Rules

### Breakpoints
- **Mobile:** 320px - 767px (4-column layout).
- **Tablet:** 768px - 1023px (8-column layout).
- **Desktop:** 1024px+ (12-column layout).

No horizontal scroll is allowed. Mobile elements must wrap cleanly.



---



# 24. Design Tokens

All sizes and dimensions are specified under design tokens:
- **Spacing:** xs (4px), sm (8px), md (16px), lg (24px), xl (40px).
- **Radius:** sm (6px), md (12px), lg (20px), full (9999px).
- **Shadows:** glass, card.



---



# 25. Color System

| Color | Hex | Use Case |
|---|---|---|
| Primary | #1A56DB | Buttons, Brand Headers, Main Links |
| Accent | #7C3AED | Highlights, Secondary Features, AI States |
| Dark Surface | #111827 | Text, Dark Mode Surface |
| Light Surface | #F3F4F6 | Sub-cards, backgrounds, borders |



---



# 26. Typography

### Font Families
- **Headings:** Outfit (Outfit Sans)
- **Body Text:** Inter (Inter Variable)

### Typography Scale
- **H1:** 36px (Line height 1.2)
- **H2:** 28px (Line height 1.3)
- **H3:** 24px (Line height 1.4)
- **Body:** 16px (Line height 1.5)



---



# 27. Component Library

### Reusable UI Elements
1. **SearchInput:** Supports autocomplete, loading spinner, and Command Palette shortcuts.
2. **ComparisonCard:** Hover animation, 3D tilt, rating badge, reasoning text slot.
3. **CompareTable:** Sticky columns, expandable spec rows, collapsible groups.
4. **Button:** Primary, Secondary, Glass. Includes loading states.



---



# 28. Landing Page Specification

The landing page is the primary funnel.
- **Hero Section:** Centered search container with 3D Orb overlay.
- **Value Props Grid:** Bento-grid layout showing AI summary, price drops, and reviews.
- **Trust Section:** Customer quotes, metrics, and data source logos.
- **Call-to-Action:** Free comparison search box.



---



# 29. Search Experience

### Flow
1. User types in search box.
2. Autocomplete fetches matching categories and trending queries.
3. On pressing Enter, query is sent to AI parsing microservice.
4. Loading screen displays category skeleton cards.



---



# 30. Comparison Engine

The core comparison engine:
- Aligns product attributes across dynamic schemas.
- Maps raw values (e.g. "8GB RAM" vs "16GB RAM") to normalized scores.
- Flags gaps (missing specifications).
- Computes difference score between primary selections.



---



# 31. AI Recommendation Engine

Handles:
- Extracting user intent and constraints.
- Generating natural language summaries explaining ranks.
- Supplying confidence metrics based on review volume and spec alignment.
- Identifying and explaining trade-offs (e.g. "Option A has better performance but costs 40% more").



---



# 32. Review Aggregation Engine

- Crawls and parses reviews from Amazon, Reddit, Trustpilot, RTINGS, and specialized forums.
- Performs sentiment analysis using BERT.
- Extracts pros/cons tags.
- Removes outlier ratings and suspect bot reviews.



---



# 33. Price Tracking Engine

- Polls online retailers every 6 hours.
- Stores historical price points in database.
- Calculates lowest, highest, and median prices.
- Triggers notifications on price drops.



---



# 34. Notification System

Supports:
- In-app toast messages and notification bell alerts.
- Transactional emails via SendGrid (price alerts, verify email).
- Web push alerts for browser-based price watch.
- SMS notifications via Twilio for Pro alert channels.



---



# 35. Community Features

Allows users to:
- Comment on public comparisons.
- Upvote/downvote alternative recommendations.
- Submit custom specs updates.
- Share comparative workspace links with teammates.



---



# 36. Admin Portal

Features:
- **Dashboard:** Overview of active queries, system load, user signups.
- **Product CMS:** Edit specs, categorize attributes, configure weightings.
- **User Manager:** Roles adjustment, premium subscriptions management.
- **Audit Logs:** Monitor AI API calls and errors.



---



# 37. User Dashboard

Provides users access to:
- Saved comparisons history.
- Active price tracking watches.
- Workspace preferences and API keys.
- Billing updates and invoice downloads.



---



# 38. Analytics Dashboard

Tracks:
- Popular comparison categories.
- User search funnel conversions.
- Latency metrics per AI model.
- Revenue metrics (MRR, churn, lifetime value).



---



# 39. Reporting

- Generates PDF summaries of B2B comparisons.
- Exports CSV/JSON data of product tables.
- E-mails scheduled weekly digest reports to enterprise team leads.



---



# 40. Database Architecture

We use PostgreSQL as the primary transactional database, with pgvector enabled for high-dimensional embedding lookups. High-volume read targets (reviews, price history) are served via read replicas.



---



# 41. ER Diagrams

The database schema maps user settings, product attributes, review aggregations, notifications, comparisons, and wishlists. Relationships are defined with foreign keys and cascade delete behaviors.



---



# 42. Database Schema

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL
);
```



---



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



# 44. Authentication

All private API routes require authentication:
- Handled via JSON Web Tokens (JWT).
- Access tokens expire in 15 minutes.
- Refresh tokens are stored securely in HTTP-only cookies.



---



# 45. Authorization (RBAC)

We use Role-Based Access Control:
- **Guest:** Read-only access to landing page and public comparisons.
- **User:** Perform 10 comparisons/month, view history.
- **Pro User:** Unlimited comparisons, price tracking, saved wishlists.
- **Admin:** CMS management, user management, audit logs access.



---



# 46. AI Architecture

Our AI architecture separates query analysis, retrieval, and synthesis:
1. Query Analyzer parses natural language into constraints.
2. Embedding Service computes pgvector vectors for search.
3. Context Builder merges database records with user query.
4. LLM synthesis generates reasoning summaries.



---



# 47. Semantic Search

- Product features and descriptions are converted to 1536-dimensional embeddings using text-embedding-3-small.
- Queries are vectorized and similarity-searched using pgvector:
  ```sql
  SELECT * FROM product_embeddings ORDER BY embedding <=> $1 LIMIT 20;
  ```



---



# 48. Recommendation Algorithm

Recommendations are scored dynamically based on:
- Attribute alignment.
- Sentiment scoring of aggregated reviews.
- Price-value ratio index.
- Brand reliability weight.



---



# 49. Ranking Logic

The ranking score R is calculated as:
R = w1 * S_specs + w2 * S_reviews + w3 * S_price
where w1, w2, and w3 are dynamic weights assigned based on extracted query intent.



---



# 50. Prompt Engineering Strategy

We use structured system prompts to minimize hallucinations:
```
System Prompt:
You are an expert product analyst. Based on the provided specification schema and reviews, generate a transparent comparison. Avoid marketing language. Rely strictly on the database inputs.
```



---



# 51. Data Sources

CompareAI indexes specs and prices from:
- Official brand spec sheets.
- Retailer API integrations (BestBuy, Amazon Developer APIs).
- Aggregated professional reviews (RTINGS, CNET).
- Community platforms (Reddit, product forums).



---



# 52. Data Validation

- Mandatory schema checks for all scraped datasets.
- Sanitization of HTML/CSS tags to prevent XSS.
- Normalization of measurements (e.g. converting lbs to kgs, oz to ml).



---



# 53. Caching Strategy

We use Redis for distributed caching:
- Compare results: Cached for 24 hours (key: compare:hash).
- Auto-complete: Cached in memory (key: autocomplete:prefix).
- Session data: Cached with TTL matching JWT duration.



---



# 54. Logging

Log data is standardized using Winston in JSON format.
- Output sent to stdout / stderr.
- High-priority errors trigger alerts in Slack.
- Log levels: debug, info, warn, error.



---



# 55. Monitoring

Prometheus collects operational metrics:
- HTTP requests latency.
- Database connection pool utilization.
- Redis cache hit/miss rates.
- LLM API call error frequencies.



---



# 56. Observability

Traces are collected using OpenTelemetry:
- Tracks spans from frontend request down to PostgreSQL query.
- Visually analyzed using Jaeger/Zipkin.
- Directly integrated into Datadog dashboards.



---



# 57. Security Architecture

- SSL/TLS encryption for all endpoints (TLS 1.3).
- CORS headers strictly set to main domain and subdomains.
- CSRF protection enabled on auth-cookie routes.
- Rate limiting at API ingress.



---



# 58. Privacy

CompareAI prioritizes user privacy:
- Direct support for "Right to be Forgotten" (GDPR).
- Data anonymization for analytics processing.
- No third-party data tracking or ads.



---



# 59. Compliance Considerations

- **CCPA/GDPR:** Consent banners and data export requests handlers.
- **PCI-DSS:** Stripe SDK handles billing; no credit card details ever touch our database servers.



---



# 60. Error Handling

Standardized API error response format:
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry in 30 seconds."
  }
}
```



---



# 61. Performance Optimization

- Frontend: Next.js server components reduce client-side JS bundle sizes.
- Assets: Next/Image dynamically resizes and converts images to WebP.
- DB: Highly queried columns index tables (B-tree on categories slug).



---



# 62. Scalability Strategy

- Microservices scale horizontally in Kubernetes.
- Vector database pgvector partitions tables to reduce memory usage during similarity search.
- Media assets are distributed using CloudFront CDN.



---



# 63. DevOps Architecture

Our DevOps architecture leverages Infrastructure as Code (IaC) and cloud-native services:
- Kubernetes orchestrates Docker containers.
- AWS provides computing, database, caching, and storage.
- Prometheus monitors health metrics.



---



# 64. CI/CD

Continuous Integration and Deployment via GitHub Actions:
- **Build Phase:** Run linter, tests, and build Docker image.
- **Publish Phase:** Push image to AWS ECR.
- **Deploy Phase:** Apply Helm charts to AWS EKS staging/production cluster.



---



# 65. Docker

All services containerized:
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
CMD ["npm", "start"]
```



---



# 66. Kubernetes

Deployments utilize standard configurations:
- LoadBalancer handles incoming traffic.
- Horizontal Pod Autoscaler scales replication based on CPU usage (target 70%).
- Secrets Manager handles database credentials.



---



# 67. Infrastructure

AWS infrastructure is declared using Terraform:
- RDS PostgreSQL database.
- ElastiCache Redis cluster.
- EKS Kubernetes cluster.
- S3 Bucket for raw assets storage.



---



# 68. Backup & Disaster Recovery

- RDS PostgreSQL automated daily backups with 30-day retention.
- DB multi-AZ replication for instant failover.
- S3 bucket versioning keeps data recoverable.



---



# 69. Testing Strategy

The QA pipeline implements the classic Test Pyramid:
- **Unit Tests:** 70% coverage.
- **Integration Tests:** 20% coverage.
- **E2E Tests:** 10% coverage (critical paths).



---



# 70. Unit Testing

Unit tests cover data validators, helper algorithms, and UI state switches:
- Written using Jest and Pytest.
- Executed on every local build and commit.



---



# 71. Integration Testing

Integration tests verify database schemas, external API mocks, and Redis connectors:
- Written using Supertest.
- Executed in CI pipeline using containerized databases.



---



# 72. End-to-End Testing

Critical user paths (Search -> Compare -> Wishlist) are tested:
- Written using Playwright.
- Executed on staging before release deployments.



---



# 73. Load Testing

- Simulated load test using K6.
- Verifies system throughput (>1000 RPS).
- Measures server response time under peak load.



---



# 74. Release Strategy

- Semantic Versioning (SemVer) format.
- Automated generation of changelogs.
- Deployments use Canary strategy: 10% traffic routing initially.



---



# 75. Deployment Guide

To deploy CompareAI:
1. Provision Terraform assets: `terraform apply`
2. Build and push Docker images.
3. Deploy Helm charts to staging environment.
4. Verify tests pass.
5. Push to production namespace.



---



# 76. Coding Standards

- ESLint for JS / TS guidelines.
- Prettier config maintains styling rules.
- Python code strictly follows PEP 8.
- Semantic commit messages required: `feat:`, `fix:`, `docs:`.



---



# 77. Folder Structure

```
compareai/
├── apps/
│   ├── web/           # Next.js app
│   └── admin/         # Admin panel
├── services/
│   ├── api/           # Node.js gateway
│   └── ai-engine/     # Python service
└── packages/
    ├── database/      # Prisma / SQL migrations
    └── ui/            # Shared component library
```



---



# 78. Project Milestones

- **Milestone 1:** Database Schema & API Setup (Month 2).
- **Milestone 2:** NLP Search & Comparison Logic (Month 4).
- **Milestone 3:** MVP Release (Month 6).
- **Milestone 4:** Price Alerts & Pro features (Month 9).



---



# 79. Product Roadmap

- **Q1 2025:** Core search engine, Laptops and Credit Cards verticals.
- **Q2 2025:** Public release MVP.
- **Q3 2025:** Pro tier subscription billing, Saved workspaces.
- **Q4 2025:** API access, Chrome extension.



---



# 80. Future Enhancements

Proposed features for v2.0+:
- Voice search capabilities.
- Dynamic comparison matrix recommendations.
- VR/AR space visual comparisons.
- Native mobile applications (iOS and Android).



---



# 81. Risk Assessment

- **Risk:** LLM Hallucinations. **Mitigation:** Context schemas restrict generated facts.
- **Risk:** Crawling bans. **Mitigation:** API data feeds prioritized over web scraping.
- **Risk:** Slow latency. **Mitigation:** Redis caching and schema optimizations.



---



# 82. Appendix

- Standard spec templates for products.
- Benchmark data sets for ranking metrics validation.



---



# 83. Glossary

- **pgvector:** PostgreSQL extension for storing vector embeddings.
- **BERT:** Bidirectional Encoder Representations from Transformers.
- **JWT:** JSON Web Token.



---



