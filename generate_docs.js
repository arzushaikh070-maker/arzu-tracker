const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── COLOR PALETTE ───────────────────────────────────────────────────────────
const C = {
  primary:    "1A56DB",  // deep blue
  accent:     "7C3AED",  // violet
  dark:       "111827",
  mid:        "374151",
  light:      "6B7280",
  border:     "D1D5DB",
  bgLight:    "F3F4F6",
  bgAccent:   "EEF2FF",
  white:      "FFFFFF",
  green:      "065F46",
  greenBg:    "D1FAE5",
  red:        "991B1B",
  redBg:      "FEE2E2",
};

// ─── DOCX BUILDER HELPERS ────────────────────────────────────────────────────
const border1 = { style: BorderStyle.SINGLE, size: 1, color: C.border };
const cellBorders = { top: border1, bottom: border1, left: border1, right: border1 };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 240 },
    children: [new TextRun({ text, bold: true, size: 36, font: "Arial", color: C.dark })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, font: "Arial", color: C.primary })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: C.mid })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.mid, ...opts })]
  });
}
function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    shading: { fill: "1E1E1E", type: ShadingType.CLEAR },
    indent: { left: 360 },
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "D4D4D4" })]
  });
}
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.mid })]
  });
}
function numbered(text) {
  return new Paragraph({
    numbering: { reference: "numbers-ref", level: 0 },
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, font: "Arial", size: 22, color: C.mid })]
  });
}
function pb() {
  return new Paragraph({ children: [new PageBreak()] });
}

function th(text, width = 2000, bg = C.primary) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, font: "Arial", size: 20, color: C.white })]
    })]
  });
}
function td(text, width = 2000, bg = C.white, color = C.mid) {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: bg, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [new Paragraph({
      children: [new TextRun({ text, font: "Arial", size: 20, color })]
    })]
  });
}
function tRow(cells) { return new TableRow({ children: cells }); }
function mkTable(rows, totalWidth = 9360) {
  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    rows,
    margins: { top: 80, bottom: 80, left: 0, right: 0 }
  });
}

function renderTableFromMd(rows) {
  const filteredRows = rows.filter(r => !r.includes('---') && r.trim() !== '');
  const docxRows = [];

  filteredRows.forEach((rowStr, rowIndex) => {
    const cells = rowStr.split('|').map(c => c.trim()).filter((c, idx, arr) => idx > 0 && idx < arr.length - 1);
    const docxCells = [];
    const isHeader = rowIndex === 0;

    cells.forEach(cellText => {
      const width = Math.floor(9360 / cells.length);
      if (isHeader) {
        docxCells.push(th(cellText, width));
      } else {
        const bg = rowIndex % 2 === 0 ? C.bgLight : C.white;
        docxCells.push(td(cellText, width, bg));
      }
    });

    if (docxCells.length > 0) {
      docxRows.push(tRow(docxCells));
    }
  });

  return mkTable(docxRows);
}

// ─── MARKDOWN PARSER FOR DOCX ────────────────────────────────────────────────
function parseMarkdownToDocx(mdText) {
  const lines = mdText.split('\n');
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];
  let inTable = false;
  let tableRows = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(code(codeLines.join('\n')));
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(lines[i]);
      continue;
    }

    // Tables
    if (line.startsWith('|')) {
      tableRows.push(line);
      inTable = true;
      continue;
    } else if (inTable) {
      if (tableRows.length > 0) {
        elements.push(renderTableFromMd(tableRows));
      }
      tableRows = [];
      inTable = false;
    }

    // Headings
    if (line.startsWith('# ')) {
      elements.push(h1(line.substring(2)));
    } else if (line.startsWith('## ')) {
      elements.push(h2(line.substring(3)));
    } else if (line.startsWith('### ')) {
      elements.push(h3(line.substring(4)));
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(bullet(line.substring(2)));
    } else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^\d+\.\s(.*)/);
      elements.push(numbered(match[1]));
    } else if (line.length > 0) {
      elements.push(p(line));
    } else {
      elements.push(new Paragraph({ spacing: { before: 40, after: 40 } }));
    }
  }

  if (inTable && tableRows.length > 0) {
    elements.push(renderTableFromMd(tableRows));
  }

  return elements;
}

// ─── 83 CHAPTERS OF ENTERPRISE DOCS CONTENT ──────────────────────────────────
const chapters = [
  {
    num: 1,
    id: "01_cover_page",
    title: "Cover Page",
    content: `# CompareAI

## Tagline
Describe your requirements. AI finds the best option.

---
**Enterprise Engineering Documentation Book**
**Version:** 1.0.0 (Confidential)
**Date:** June 2026
**Classification:** Internal Use Only
**Author:** CompareAI Engineering & Design Group
---

This document outlines the architectural patterns, design specifications, and implementation steps required to build the CompareAI comparison platform.`
  },
  {
    num: 2,
    id: "02_version_history",
    title: "Version History",
    content: `# 2. Version History

| Version | Date | Author | Description |
|---|---|---|---|
| 1.0.0 | 2026-06-26 | Engineering Team | Initial release — all 83 chapters complete |
| 0.9.0 | 2026-06-15 | Product Manager | Internal review draft — all chapters |
| 0.8.0 | 2026-05-30 | Solution Architect | Architecture chapters added |
| 0.5.0 | 2026-04-01 | Product Manager | First complete outline |`
  },
  {
    num: 3,
    id: "03_table_of_contents",
    title: "Table of Contents",
    content: `# 3. Table of Contents

Please refer to the index file or the compiled PDF/Word TOC structure for a list of all 83 chapters. Every section in this documentation follows modular routing guidelines.`
  },
  {
    num: 4,
    id: "04_executive_summary",
    title: "Executive Summary",
    content: `# 4. Executive Summary

CompareAI is an AI-powered universal comparison and decision platform designed to eliminate decision paralysis across every consumer and enterprise vertical. Users describe their requirements in natural language; CompareAI understands intent, retrieves structured data from authoritative sources, aggregates trusted reviews, ranks alternatives, and returns explainable, confidence-scored recommendations in seconds.

The platform operates across virtually any category: consumer electronics, software tools, AI models, cloud providers, financial products, educational programs, SaaS platforms, healthcare services, and unlimited future categories powered by a dynamic attribute schema.`
  },
  {
    num: 5,
    id: "05_product_vision",
    title: "Product Vision",
    content: `# 5. Product Vision

CompareAI's vision is to become the world's universal AI decision layer — the place humans and systems go when they need to choose between alternatives with confidence.

### North Star
"Any person, any category, any device — understand what they need, find the best option, explain why, in under 10 seconds."

### Three-Year Vision
- **Year 1:** Launch with 10 categories, 1M products, 50M reviews indexed, 100K MAU.
- **Year 2:** Expand to 50 categories, real-time price tracking, browser extension, mobile apps, 1M MAU.
- **Year 3:** Enterprise APIs, white-label platform, 500+ category support, 10M MAU, profitability.`
  },
  {
    num: 6,
    id: "06_business_goals",
    title: "Business Goals",
    content: `# 6. Business Goals

### Primary Goals
- Launch MVP with 10 categories live in Q2 2025.
- Reach 10,000 monthly active users (MAU) within 6 months.
- Generate $100K Annual Recurring Revenue (ARR) through Pro subscriptions by Q4 2025.
- Grow to 100K MAU and launch Enterprise Beta by Q2 2026.

### Revenue Model Detail
- **Free Tier:** 10 comparisons/month, 3 categories, basic AI, no saved data.
- **Pro ($12/mo):** Unlimited comparisons, all categories, full AI, price alerts, wishlists, history.
- **Team ($49/mo per 5 seats):** Shared workspaces, collaborative comparisons, exports.
- **Enterprise (custom):** SSO, API access, white-label, SLA, dedicated support.`
  },
  {
    num: 7,
    id: "07_problem_statement",
    title: "Problem Statement",
    content: `# 7. Problem Statement

Modern buyers face comparison overload. The average consumer visits 4-7 websites and spends 3-8 hours researching a mid-complexity purchase. Enterprise buyers spend weeks in spreadsheet-driven evaluations that surface incomplete, biased, or outdated information. Existing comparison tools are category-siloed, ad-supported, and incapable of natural language interaction.`
  },
  {
    num: 8,
    id: "08_success_metrics",
    title: "Success Metrics",
    content: `# 8. Success Metrics

| Metric | Target (6mo) | Target (12mo) | Measurement |
|---|---|---|---|
| Monthly Active Users | 10,000 | 100,000 | Mixpanel / PostHog |
| Search-to-Comparison Rate | >70% | >80% | Event tracking |
| AI Recommendation Satisfaction | >4.0/5.0 | >4.3/5.0 | In-app rating widget |
| Free-to-Pro Conversion | >5% | >8% | Stripe analytics |
| Pro Churn Rate | <5%/mo | <3%/mo | Stripe |
| P99 Response Time | <3s | <2s | Datadog APM |`
  },
  {
    num: 9,
    id: "09_scope",
    title: "Scope",
    content: `# 9. Scope

### MVP Scope (v1.0)
- 10 initial categories: Laptops, Smartphones, Headphones, Cloud Storage, Project Management SaaS, AI Writing Tools, Credit Cards, Online Learning Platforms, Mechanical Keyboards, Standing Desks.
- Natural language search with intent and entity extraction.
- AI-powered comparison cards with ranked results (top 5 per query).
- Review aggregation from 5+ sources per category.
- User accounts: Google OAuth and email/password.
- Freemium tier with 10 comparisons/month limit.`
  },
  {
    num: 10,
    id: "10_out_of_scope",
    title: "Out of Scope",
    content: `# 10. Out of Scope

The following are explicitly excluded from the current product scope to maintain focus:
- Direct e-commerce purchasing or affiliate checkout flows in v1.0.
- Real-time inventory availability across retailers.
- User-generated product submissions without admin review in v1.0.
- Video content hosting or streaming.
- Social networking or follower mechanics.`
  },
  {
    num: 11,
    id: "11_personas",
    title: "Personas",
    content: `# 11. Personas

### Persona 1: Maya, 31, Marketing Manager (Austin, TX)
- **Goal:** Buy a noise-cancelling headphone under $300 for WFH and commuting.
- **Pain:** Spent 4 hours reading Reddit and Wirecutter; still unsure.
- **Quote:** "Just tell me what to buy and why. I don't have time to become an audiophile."

### Persona 2: Daniel, 38, Engineering Manager (London)
- **Goal:** Evaluate 3 cloud providers for a new microservices workload: cost, latency, compliance.
- **Pain:** Comparison spreadsheets take days; pricing calculators are incomparable.`
  },
  {
    num: 12,
    id: "12_user_journeys",
    title: "User Journeys",
    content: `# 12. User Journeys

### Consumer Product Purchase Journey
1. User lands on CompareAI homepage and types: "best laptop for video editing under $2000 with good battery life".
2. System detects intent: PRODUCT_SEARCH; category: LAPTOPS; extracts constraints: budget=$2000, use_case=video_editing, priority=battery_life.
3. Semantic search retrieves top 20 candidates from product graph.
4. Ranking engine scores on matched attributes, review scores, price-value ratio.
5. Top 5 results render as animated comparison cards with confidence indicators.`
  },
  {
    num: 13,
    id: "13_user_stories",
    title: "User Stories",
    content: `# 13. User Stories

| ID | As a... | I want to... | So that... |
|---|---|---|---|
| US-001 | Free user | Type my requirements in plain English | I don't have to learn a filter UI |
| US-002 | Free user | See ranked comparison results in <10 seconds | I can make quick decisions |
| US-003 | Free user | See why AI ranked each option | I trust the recommendation |
| US-004 | Pro user | Save comparisons to a wishlist | I can revisit them later |
| US-005 | Pro user | Set price drop alerts | I buy at the right time |`
  },
  {
    num: 14,
    id: "14_functional_requirements",
    title: "Functional Requirements",
    content: `# 14. Functional Requirements

### Search System (FR-SRCH)
- **FR-SRCH-001:** System shall accept natural language query of 1–500 characters.
- **FR-SRCH-002:** System shall detect primary intent from query.
- **FR-SRCH-003:** System shall extract entities: category, budget, brand preferences, use cases.
- **FR-SRCH-004:** System shall return minimum 3 and maximum 10 ranked results per query.
- **FR-SRCH-005:** System shall complete search in <3 seconds P95.`
  },
  {
    num: 15,
    id: "15_non_functional_requirements",
    title: "Non-functional Requirements",
    content: `# 15. Non-functional Requirements

### Performance
- **NFR-PERF-001:** Search response time P50 shall be <1.0s for cached queries.
- **NFR-PERF-002:** Search response time P95 shall be <3.0s for cold queries with live AI inference.
- **NFR-PERF-003:** Page load (LCP) shall be <2.5s on a 3G mobile device.

### Reliability
- **NFR-REL-001:** System uptime shall be 99.9% monthly SLA for Pro users.`
  },
  {
    num: 16,
    id: "16_information_architecture",
    title: "Information Architecture",
    content: `# 16. Information Architecture

### Site Map
The CompareAI information architecture is organized into five primary zones:
- **Public Zone:** /, /categories, /compare/[slug], /pricing, /about
- **Auth Zone:** /login, /register, /forgot-password
- **User Zone:** /dashboard, /history, /wishlists, /settings
- **Admin Zone:** /admin/overview, /admin/products, /admin/categories
- **API Zone:** /api/v1/*`
  },
  {
    num: 17,
    id: "17_navigation_structure",
    title: "Navigation Structure",
    content: `# 17. Navigation Structure

### Primary Navigation (Desktop)
Sticky top navbar with glass effect background:
- Logo mark (animated SVG) -> /
- Categories dropdown (mega menu with category tiles)
- Pricing -> /pricing
- Search bar (Command Palette activation via Cmd+K)
- User avatar dropdown (Dashboard, Wishlists, Settings, Sign Out)`
  },
  {
    num: 18,
    id: "18_ux_principles",
    title: "UX Principles",
    content: `# 18. UX Principles

- **Query-First:** Users lead with natural language, never form fields.
- **Instant Feedback:** Skeleton loaders appear within 100ms; AI streams tokens.
- **Transparent AI:** Show evidence, confidence, and reasoning for every rank.
- **Progressive Disclosure:** Summary first; expand for deep-dive attribute details.`
  },
  {
    num: 19,
    id: "19_ui_design_system",
    title: "UI Design System",
    content: `# 19. UI Design System

### Design System Tokens
We use a premium visual identity characterized by glassmorphism, high contrast, clean typography, and spacious layouts.

\`\`\`json
{
  "color": {
    "brand-primary": "#1A56DB",
    "brand-accent": "#7C3AED",
    "surface-glass": "rgba(255,255,255,0.08)",
    "border-glass": "rgba(255,255,255,0.12)"
  }
}
\`\`\``
  },
  {
    num: 20,
    id: "20_3d_experience_design",
    title: "3D Experience Design",
    content: `# 20. 3D Experience Design

### Philosophy
3D effects serve communication, not decoration. 3D elements communicate state, provide delight, and aid user orientation.

### Hero Section Orb
The landing page hero features a rotating AI hologram orb built with React Three Fiber:
- Material: MeshDistortMaterial (metalness 0.9, roughness 0.1, distort 0.35, speed 2).
- Performance boundary: disable WebGL on devices with <4GB RAM.`
  },
  {
    num: 21,
    id: "21_motion_design_guidelines",
    title: "Motion Design Guidelines",
    content: `# 21. Motion Design Guidelines

### Timing Scale
- **motion-fast (150ms):** Button press, checkboxes, toggles.
- **motion-base (250ms):** Card hover, menu slide-in, tooltips.
- **motion-slow (400ms):** Page transitions, modal entering.

### Easing Tokens
Use spring-based physics curves for natural tactility:
- Stiffness: 300, Damping: 20.`
  },
  {
    num: 22,
    id: "22_accessibility_standards",
    title: "Accessibility Standards",
    content: `# 22. Accessibility Standards

CompareAI targets WCAG 2.1 Level AA compliance.
- **Contrast:** Minimum 4.5:1 ratio for normal body text.
- **Keyboard Navigation:** Tab index follows logical visual layout order.
- **Focus Rings:** 3px solid #1A56DB with 2px offset.
- **Screen Readers:** Custom aria-labels for all interactive icon buttons.`
  },
  {
    num: 23,
    id: "23_responsive_design_rules",
    title: "Responsive Design Rules",
    content: `# 23. Responsive Design Rules

### Breakpoints
- **Mobile:** 320px - 767px (4-column layout).
- **Tablet:** 768px - 1023px (8-column layout).
- **Desktop:** 1024px+ (12-column layout).

No horizontal scroll is allowed. Mobile elements must wrap cleanly.`
  },
  {
    num: 24,
    id: "24_design_tokens",
    title: "Design Tokens",
    content: `# 24. Design Tokens

All sizes and dimensions are specified under design tokens:
- **Spacing:** xs (4px), sm (8px), md (16px), lg (24px), xl (40px).
- **Radius:** sm (6px), md (12px), lg (20px), full (9999px).
- **Shadows:** glass, card.`
  },
  {
    num: 25,
    id: "25_color_system",
    title: "Color System",
    content: `# 25. Color System

| Color | Hex | Use Case |
|---|---|---|
| Primary | #1A56DB | Buttons, Brand Headers, Main Links |
| Accent | #7C3AED | Highlights, Secondary Features, AI States |
| Dark Surface | #111827 | Text, Dark Mode Surface |
| Light Surface | #F3F4F6 | Sub-cards, backgrounds, borders |`
  },
  {
    num: 26,
    id: "26_typography",
    title: "Typography",
    content: `# 26. Typography

### Font Families
- **Headings:** Outfit (Outfit Sans)
- **Body Text:** Inter (Inter Variable)

### Typography Scale
- **H1:** 36px (Line height 1.2)
- **H2:** 28px (Line height 1.3)
- **H3:** 24px (Line height 1.4)
- **Body:** 16px (Line height 1.5)`
  },
  {
    num: 27,
    id: "27_component_library",
    title: "Component Library",
    content: `# 27. Component Library

### Reusable UI Elements
1. **SearchInput:** Supports autocomplete, loading spinner, and Command Palette shortcuts.
2. **ComparisonCard:** Hover animation, 3D tilt, rating badge, reasoning text slot.
3. **CompareTable:** Sticky columns, expandable spec rows, collapsible groups.
4. **Button:** Primary, Secondary, Glass. Includes loading states.`
  },
  {
    num: 28,
    id: "28_landing_page_specification",
    title: "Landing Page Specification",
    content: `# 28. Landing Page Specification

The landing page is the primary funnel.
- **Hero Section:** Centered search container with 3D Orb overlay.
- **Value Props Grid:** Bento-grid layout showing AI summary, price drops, and reviews.
- **Trust Section:** Customer quotes, metrics, and data source logos.
- **Call-to-Action:** Free comparison search box.`
  },
  {
    num: 29,
    id: "29_search_experience",
    title: "Search Experience",
    content: `# 29. Search Experience

### Flow
1. User types in search box.
2. Autocomplete fetches matching categories and trending queries.
3. On pressing Enter, query is sent to AI parsing microservice.
4. Loading screen displays category skeleton cards.`
  },
  {
    num: 30,
    id: "30_comparison_engine",
    title: "Comparison Engine",
    content: `# 30. Comparison Engine

The core comparison engine:
- Aligns product attributes across dynamic schemas.
- Maps raw values (e.g. "8GB RAM" vs "16GB RAM") to normalized scores.
- Flags gaps (missing specifications).
- Computes difference score between primary selections.`
  },
  {
    num: 31,
    id: "31_ai_recommendation_engine",
    title: "AI Recommendation Engine",
    content: `# 31. AI Recommendation Engine

Handles:
- Extracting user intent and constraints.
- Generating natural language summaries explaining ranks.
- Supplying confidence metrics based on review volume and spec alignment.
- Identifying and explaining trade-offs (e.g. "Option A has better performance but costs 40% more").`
  },
  {
    num: 32,
    id: "32_review_aggregation_engine",
    title: "Review Aggregation Engine",
    content: `# 32. Review Aggregation Engine

- Crawls and parses reviews from Amazon, Reddit, Trustpilot, RTINGS, and specialized forums.
- Performs sentiment analysis using BERT.
- Extracts pros/cons tags.
- Removes outlier ratings and suspect bot reviews.`
  },
  {
    num: 33,
    id: "33_price_tracking_engine",
    title: "Price Tracking Engine",
    content: `# 33. Price Tracking Engine

- Polls online retailers every 6 hours.
- Stores historical price points in database.
- Calculates lowest, highest, and median prices.
- Triggers notifications on price drops.`
  },
  {
    num: 34,
    id: "34_notification_system",
    title: "Notification System",
    content: `# 34. Notification System

Supports:
- In-app toast messages and notification bell alerts.
- Transactional emails via SendGrid (price alerts, verify email).
- Web push alerts for browser-based price watch.
- SMS notifications via Twilio for Pro alert channels.`
  },
  {
    num: 35,
    id: "35_community_features",
    title: "Community Features",
    content: `# 35. Community Features

Allows users to:
- Comment on public comparisons.
- Upvote/downvote alternative recommendations.
- Submit custom specs updates.
- Share comparative workspace links with teammates.`
  },
  {
    num: 36,
    id: "36_admin_portal",
    title: "Admin Portal",
    content: `# 36. Admin Portal

Features:
- **Dashboard:** Overview of active queries, system load, user signups.
- **Product CMS:** Edit specs, categorize attributes, configure weightings.
- **User Manager:** Roles adjustment, premium subscriptions management.
- **Audit Logs:** Monitor AI API calls and errors.`
  },
  {
    num: 37,
    id: "37_user_dashboard",
    title: "User Dashboard",
    content: `# 37. User Dashboard

Provides users access to:
- Saved comparisons history.
- Active price tracking watches.
- Workspace preferences and API keys.
- Billing updates and invoice downloads.`
  },
  {
    num: 38,
    id: "38_analytics_dashboard",
    title: "Analytics Dashboard",
    content: `# 38. Analytics Dashboard

Tracks:
- Popular comparison categories.
- User search funnel conversions.
- Latency metrics per AI model.
- Revenue metrics (MRR, churn, lifetime value).`
  },
  {
    num: 39,
    id: "39_reporting",
    title: "Reporting",
    content: `# 39. Reporting

- Generates PDF summaries of B2B comparisons.
- Exports CSV/JSON data of product tables.
- E-mails scheduled weekly digest reports to enterprise team leads.`
  },
  {
    num: 40,
    id: "40_database_architecture",
    title: "Database Architecture",
    content: `# 40. Database Architecture

We use PostgreSQL as the primary transactional database, with pgvector enabled for high-dimensional embedding lookups. High-volume read targets (reviews, price history) are served via read replicas.`
  },
  {
    num: 41,
    id: "41_er_diagrams",
    title: "ER Diagrams",
    content: `# 41. ER Diagrams

The database schema maps user settings, product attributes, review aggregations, notifications, comparisons, and wishlists. Relationships are defined with foreign keys and cascade delete behaviors.`
  },
  {
    num: 42,
    id: "42_database_schema",
    title: "Database Schema",
    content: `# 42. Database Schema

\`\`\`sql
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
\`\`\``
  },
  {
    num: 43,
    id: "43_api_specification",
    title: "API Specification",
    content: `# 43. API Specification

### POST /api/v1/compare
Request comparison of products based on natural language prompt.
- **Request Body:**
  \`\`\`json
  {
    "query": "best laptop for programming under $1500"
  }
  \`\`\`
- **Response Body:**
  \`\`\`json
  {
    "category": "laptops",
    "recommendations": [
      { "name": "Dell XPS 13", "rank": 1, "score": 9.4 }
    ]
  }
  \`\`\``
  },
  {
    num: 44,
    id: "44_authentication",
    title: "Authentication",
    content: `# 44. Authentication

All private API routes require authentication:
- Handled via JSON Web Tokens (JWT).
- Access tokens expire in 15 minutes.
- Refresh tokens are stored securely in HTTP-only cookies.`
  },
  {
    num: 45,
    id: "45_authorization_rbac",
    title: "Authorization (RBAC)",
    content: `# 45. Authorization (RBAC)

We use Role-Based Access Control:
- **Guest:** Read-only access to landing page and public comparisons.
- **User:** Perform 10 comparisons/month, view history.
- **Pro User:** Unlimited comparisons, price tracking, saved wishlists.
- **Admin:** CMS management, user management, audit logs access.`
  },
  {
    num: 46,
    id: "46_ai_architecture",
    title: "AI Architecture",
    content: `# 46. AI Architecture

Our AI architecture separates query analysis, retrieval, and synthesis:
1. Query Analyzer parses natural language into constraints.
2. Embedding Service computes pgvector vectors for search.
3. Context Builder merges database records with user query.
4. LLM synthesis generates reasoning summaries.`
  },
  {
    num: 47,
    id: "47_semantic_search",
    title: "Semantic Search",
    content: `# 47. Semantic Search

- Product features and descriptions are converted to 1536-dimensional embeddings using text-embedding-3-small.
- Queries are vectorized and similarity-searched using pgvector:
  \`\`\`sql
  SELECT * FROM product_embeddings ORDER BY embedding <=> $1 LIMIT 20;
  \`\`\``
  },
  {
    num: 48,
    id: "48_recommendation_algorithm",
    title: "Recommendation Algorithm",
    content: `# 48. Recommendation Algorithm

Recommendations are scored dynamically based on:
- Attribute alignment.
- Sentiment scoring of aggregated reviews.
- Price-value ratio index.
- Brand reliability weight.`
  },
  {
    num: 49,
    id: "49_ranking_logic",
    title: "Ranking Logic",
    content: `# 49. Ranking Logic

The ranking score R is calculated as:
R = w1 * S_specs + w2 * S_reviews + w3 * S_price
where w1, w2, and w3 are dynamic weights assigned based on extracted query intent.`
  },
  {
    num: 50,
    id: "50_prompt_engineering_strategy",
    title: "Prompt Engineering Strategy",
    content: `# 50. Prompt Engineering Strategy

We use structured system prompts to minimize hallucinations:
\`\`\`
System Prompt:
You are an expert product analyst. Based on the provided specification schema and reviews, generate a transparent comparison. Avoid marketing language. Rely strictly on the database inputs.
\`\`\``
  },
  {
    num: 51,
    id: "51_data_sources",
    title: "Data Sources",
    content: `# 51. Data Sources

CompareAI indexes specs and prices from:
- Official brand spec sheets.
- Retailer API integrations (BestBuy, Amazon Developer APIs).
- Aggregated professional reviews (RTINGS, CNET).
- Community platforms (Reddit, product forums).`
  },
  {
    num: 52,
    id: "52_data_validation",
    title: "Data Validation",
    content: `# 52. Data Validation

- Mandatory schema checks for all scraped datasets.
- Sanitization of HTML/CSS tags to prevent XSS.
- Normalization of measurements (e.g. converting lbs to kgs, oz to ml).`
  },
  {
    num: 53,
    id: "53_caching_strategy",
    title: "Caching Strategy",
    content: `# 53. Caching Strategy

We use Redis for distributed caching:
- Compare results: Cached for 24 hours (key: compare:hash).
- Auto-complete: Cached in memory (key: autocomplete:prefix).
- Session data: Cached with TTL matching JWT duration.`
  },
  {
    num: 54,
    id: "54_logging",
    title: "Logging",
    content: `# 54. Logging

Log data is standardized using Winston in JSON format.
- Output sent to stdout / stderr.
- High-priority errors trigger alerts in Slack.
- Log levels: debug, info, warn, error.`
  },
  {
    num: 55,
    id: "55_monitoring",
    title: "Monitoring",
    content: `# 55. Monitoring

Prometheus collects operational metrics:
- HTTP requests latency.
- Database connection pool utilization.
- Redis cache hit/miss rates.
- LLM API call error frequencies.`
  },
  {
    num: 56,
    id: "56_observability",
    title: "Observability",
    content: `# 56. Observability

Traces are collected using OpenTelemetry:
- Tracks spans from frontend request down to PostgreSQL query.
- Visually analyzed using Jaeger/Zipkin.
- Directly integrated into Datadog dashboards.`
  },
  {
    num: 57,
    id: "57_security_architecture",
    title: "Security Architecture",
    content: `# 57. Security Architecture

- SSL/TLS encryption for all endpoints (TLS 1.3).
- CORS headers strictly set to main domain and subdomains.
- CSRF protection enabled on auth-cookie routes.
- Rate limiting at API ingress.`
  },
  {
    num: 58,
    id: "58_privacy",
    title: "Privacy",
    content: `# 58. Privacy

CompareAI prioritizes user privacy:
- Direct support for "Right to be Forgotten" (GDPR).
- Data anonymization for analytics processing.
- No third-party data tracking or ads.`
  },
  {
    num: 59,
    id: "59_compliance_considerations",
    title: "Compliance Considerations",
    content: `# 59. Compliance Considerations

- **CCPA/GDPR:** Consent banners and data export requests handlers.
- **PCI-DSS:** Stripe SDK handles billing; no credit card details ever touch our database servers.`
  },
  {
    num: 60,
    id: "60_error_handling",
    title: "Error Handling",
    content: `# 60. Error Handling

Standardized API error response format:
\`\`\`json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please retry in 30 seconds."
  }
}
\`\`\``
  },
  {
    num: 61,
    id: "61_performance_optimization",
    title: "Performance Optimization",
    content: `# 61. Performance Optimization

- Frontend: Next.js server components reduce client-side JS bundle sizes.
- Assets: Next/Image dynamically resizes and converts images to WebP.
- DB: Highly queried columns index tables (B-tree on categories slug).`
  },
  {
    num: 62,
    id: "62_scalability_strategy",
    title: "Scalability Strategy",
    content: `# 62. Scalability Strategy

- Microservices scale horizontally in Kubernetes.
- Vector database pgvector partitions tables to reduce memory usage during similarity search.
- Media assets are distributed using CloudFront CDN.`
  },
  {
    num: 63,
    id: "63_devops_architecture",
    title: "DevOps Architecture",
    content: `# 63. DevOps Architecture

Our DevOps architecture leverages Infrastructure as Code (IaC) and cloud-native services:
- Kubernetes orchestrates Docker containers.
- AWS provides computing, database, caching, and storage.
- Prometheus monitors health metrics.`
  },
  {
    num: 64,
    id: "64_cicd",
    title: "CI/CD",
    content: `# 64. CI/CD

Continuous Integration and Deployment via GitHub Actions:
- **Build Phase:** Run linter, tests, and build Docker image.
- **Publish Phase:** Push image to AWS ECR.
- **Deploy Phase:** Apply Helm charts to AWS EKS staging/production cluster.`
  },
  {
    num: 65,
    id: "65_docker",
    title: "Docker",
    content: `# 65. Docker

All services containerized:
\`\`\`dockerfile
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
\`\`\``
  },
  {
    num: 66,
    id: "66_kubernetes",
    title: "Kubernetes",
    content: `# 66. Kubernetes

Deployments utilize standard configurations:
- LoadBalancer handles incoming traffic.
- Horizontal Pod Autoscaler scales replication based on CPU usage (target 70%).
- Secrets Manager handles database credentials.`
  },
  {
    num: 67,
    id: "67_infrastructure",
    title: "Infrastructure",
    content: `# 67. Infrastructure

AWS infrastructure is declared using Terraform:
- RDS PostgreSQL database.
- ElastiCache Redis cluster.
- EKS Kubernetes cluster.
- S3 Bucket for raw assets storage.`
  },
  {
    num: 68,
    id: "68_backup_disaster_recovery",
    title: "Backup & Disaster Recovery",
    content: `# 68. Backup & Disaster Recovery

- RDS PostgreSQL automated daily backups with 30-day retention.
- DB multi-AZ replication for instant failover.
- S3 bucket versioning keeps data recoverable.`
  },
  {
    num: 69,
    id: "69_testing_strategy",
    title: "Testing Strategy",
    content: `# 69. Testing Strategy

The QA pipeline implements the classic Test Pyramid:
- **Unit Tests:** 70% coverage.
- **Integration Tests:** 20% coverage.
- **E2E Tests:** 10% coverage (critical paths).`
  },
  {
    num: 70,
    id: "70_unit_testing",
    title: "Unit Testing",
    content: `# 70. Unit Testing

Unit tests cover data validators, helper algorithms, and UI state switches:
- Written using Jest and Pytest.
- Executed on every local build and commit.`
  },
  {
    num: 71,
    id: "71_integration_testing",
    title: "Integration Testing",
    content: `# 71. Integration Testing

Integration tests verify database schemas, external API mocks, and Redis connectors:
- Written using Supertest.
- Executed in CI pipeline using containerized databases.`
  },
  {
    num: 72,
    id: "72_end_to_end_testing",
    title: "End-to-End Testing",
    content: `# 72. End-to-End Testing

Critical user paths (Search -> Compare -> Wishlist) are tested:
- Written using Playwright.
- Executed on staging before release deployments.`
  },
  {
    num: 73,
    id: "73_load_testing",
    title: "Load Testing",
    content: `# 73. Load Testing

- Simulated load test using K6.
- Verifies system throughput (>1000 RPS).
- Measures server response time under peak load.`
  },
  {
    num: 74,
    id: "74_release_strategy",
    title: "Release Strategy",
    content: `# 74. Release Strategy

- Semantic Versioning (SemVer) format.
- Automated generation of changelogs.
- Deployments use Canary strategy: 10% traffic routing initially.`
  },
  {
    num: 75,
    id: "75_deployment_guide",
    title: "Deployment Guide",
    content: `# 75. Deployment Guide

To deploy CompareAI:
1. Provision Terraform assets: \`terraform apply\`
2. Build and push Docker images.
3. Deploy Helm charts to staging environment.
4. Verify tests pass.
5. Push to production namespace.`
  },
  {
    num: 76,
    id: "76_coding_standards",
    title: "Coding Standards",
    content: `# 76. Coding Standards

- ESLint for JS / TS guidelines.
- Prettier config maintains styling rules.
- Python code strictly follows PEP 8.
- Semantic commit messages required: \`feat:\`, \`fix:\`, \`docs:\`.`
  },
  {
    num: 77,
    id: "77_folder_structure",
    title: "Folder Structure",
    content: `# 77. Folder Structure

\`\`\`
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
\`\`\``
  },
  {
    num: 78,
    id: "78_project_milestones",
    title: "Project Milestones",
    content: `# 78. Project Milestones

- **Milestone 1:** Database Schema & API Setup (Month 2).
- **Milestone 2:** NLP Search & Comparison Logic (Month 4).
- **Milestone 3:** MVP Release (Month 6).
- **Milestone 4:** Price Alerts & Pro features (Month 9).`
  },
  {
    num: 79,
    id: "79_product_roadmap",
    title: "Product Roadmap",
    content: `# 79. Product Roadmap

- **Q1 2025:** Core search engine, Laptops and Credit Cards verticals.
- **Q2 2025:** Public release MVP.
- **Q3 2025:** Pro tier subscription billing, Saved workspaces.
- **Q4 2025:** API access, Chrome extension.`
  },
  {
    num: 80,
    id: "80_future_enhancements",
    title: "Future Enhancements",
    content: `# 80. Future Enhancements

Proposed features for v2.0+:
- Voice search capabilities.
- Dynamic comparison matrix recommendations.
- VR/AR space visual comparisons.
- Native mobile applications (iOS and Android).`
  },
  {
    num: 81,
    id: "81_risk_assessment",
    title: "Risk Assessment",
    content: `# 81. Risk Assessment

- **Risk:** LLM Hallucinations. **Mitigation:** Context schemas restrict generated facts.
- **Risk:** Crawling bans. **Mitigation:** API data feeds prioritized over web scraping.
- **Risk:** Slow latency. **Mitigation:** Redis caching and schema optimizations.`
  },
  {
    num: 82,
    id: "82_appendix",
    title: "Appendix",
    content: `# 82. Appendix

- Standard spec templates for products.
- Benchmark data sets for ranking metrics validation.`
  },
  {
    num: 83,
    id: "83_glossary",
    title: "Glossary",
    content: `# 83. Glossary

- **pgvector:** PostgreSQL extension for storing vector embeddings.
- **BERT:** Bidirectional Encoder Representations from Transformers.
- **JWT:** JSON Web Token.`
  }
];

// ─── MASTER COMPILATION & GENERATION ─────────────────────────────────────────
async function run() {
  console.log("Generating documentation...");

  // 1. Create docs folders
  const docsDir = path.join(__dirname, 'docs');
  const chaptersDir = path.join(docsDir, 'chapters');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir);
  if (!fs.existsSync(chaptersDir)) fs.mkdirSync(chaptersDir);

  // 2. Generate individual chapter markdown files
  let masterMdContent = '';
  let indexMdContent = '# CompareAI Enterprise Documentation Book\n\n## Table of Contents\n\n';

  chapters.forEach((ch) => {
    const filename = `${ch.id}.md`;
    const filepath = path.join(chaptersDir, filename);

    // Add navigation links to markdown
    const relativePrev = ch.num > 1 ? `${chapters[ch.num - 2].id}.md` : null;
    const relativeNext = ch.num < chapters.length ? `${chapters[ch.num].id}.md` : null;

    let navHeader = '';
    if (relativePrev || relativeNext) {
      navHeader = '\n\n---\n';
      if (relativePrev) navHeader += `[← Previous Chapter](${relativePrev}) | `;
      navHeader += `[Index](../index.md)`;
      if (relativeNext) navHeader += ` | [Next Chapter →](${relativeNext})`;
      navHeader += '\n';
    }

    const mdContentWithNav = ch.content + navHeader;

    fs.writeFileSync(filepath, mdContentWithNav, 'utf8');
    console.log(`Generated chapter: ${filename}`);

    masterMdContent += ch.content + '\n\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n\n';
    indexMdContent += `${ch.num}. [${ch.title}](chapters/${filename})\n`;
  });

  // 3. Write index.md
  fs.writeFileSync(path.join(docsDir, 'index.md'), indexMdContent, 'utf8');
  console.log("Generated index.md");

  // 4. Write README.md
  const readmeContent = `# CompareAI Enterprise Documentation

This directory contains the modular 83-chapter source documentation.

- [Index / Table of Contents](index.md)
- Chapters are stored under the [chapters/](chapters/) folder.

To compile all chapters into the single master documentation book, run \`node generate_docs.js\` from the root folder.`;
  fs.writeFileSync(path.join(docsDir, 'README.md'), readmeContent, 'utf8');
  console.log("Generated docs/README.md");

  // 5. Write compiled book in Markdown
  const masterMdClean = masterMdContent.replace(/<w:p>.*?<\/w:p>/g, '\n\n---\n\n');
  fs.writeFileSync(path.join(__dirname, 'CompareAI_Enterprise_Documentation_Book.md'), masterMdClean, 'utf8');
  console.log("Generated CompareAI_Enterprise_Documentation_Book.md");

  // 6. Build DOCX Document
  const docElements = [];

  // Add cover page
  docElements.push(...parseMarkdownToDocx(chapters[0].content));

  // Add each remaining chapter with a page break before it
  for (let i = 1; i < chapters.length; i++) {
    docElements.push(pb());
    docElements.push(...parseMarkdownToDocx(chapters[i].content));
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch
            bottom: 1440,
            left: 1440,
            right: 1440,
          }
        }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "CompareAI Enterprise Engineering Handbook — Confidential", size: 16, color: C.light, font: "Arial" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Page ", size: 18, color: C.light, font: "Arial" }), new TextRun({ children: [PageNumber.CURRENT], size: 18, color: C.light, font: "Arial" })]
          })]
        })
      },
      children: docElements
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(__dirname, 'CompareAI_Enterprise_Documentation.docx'), buffer);
  console.log("Generated CompareAI_Enterprise_Documentation.docx successfully.");
}

run().catch(console.error);
