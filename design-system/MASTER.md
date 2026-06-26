# CompareAI Design System - Global Source of Truth (MASTER.md)

This document defines the design tokens, interactive states, styling overrides, and accessibility rules for the CompareAI web application.

## 1. Color Palette Tokens

| Token Name | Hex Code | Visual Profile | Role / Application |
|---|---|---|---|
| `--color-bg-base` | `#080C14` | Pitch Deep Blue/Black | Master backdrop |
| `--color-bg-surface` | `#111625` | Dark Navy | Primary card and panel backgrounds |
| `--color-glass` | `rgba(255, 255, 255, 0.05)` | Semi-transparent white | Glassmorphic floating surfaces |
| `--color-primary` | `#1A56DB` | Slate Deep Blue | Main CTAs, primary active actions |
| `--color-accent` | `#7C3AED` | Royal Violet | AI highlights, active processing cues |
| `--color-border-glass`| `rgba(255, 255, 255, 0.1)` | Low-opacity borders | Subtle separators and outlines |
| `--color-text-primary`| `#F9FAFB` | Ice White | Title headings, primary text |
| `--color-text-muted` | `#9CA3AF` | Neutral Gray | Body text, captions, secondary specs |

---

## 2. Typography Rules

- **Heading Font Family**: `Outfit`, sans-serif (imported from Google Fonts).
- **Body Font Family**: `Inter`, sans-serif.
- **Base Font Size**: `16px` (ensuring touch friendliness and readable layouts on mobile devices).
- **Line Heights**: `1.2` for headings, `1.5` for body text.

---

## 3. Motion & Transitions

- **Primary Easing**: `cubic-bezier(0.16, 1, 0.3, 1)` (spring-like fluid response).
- **Duration Scale**:
  - `fast`: `150ms` (interactive buttons, icons active states).
  - `medium`: `250ms` (card hover transformations, panel transitions).
  - `slow`: `450ms` (modal entrance, dynamic results list staggers).
- **Parallax and Tilt**: Hovering on result cards should tilt them by `3deg` on X and Y axes, matching custom perspective styles.

---

## 4. Accessibility and HTML Best Practices

- **Contrast**: Foreground text matches a minimum ratio of `4.5:1` against the dark surfaces.
- **Focus Rings**: Focusable buttons/inputs must show a distinct outline ring: `2px solid var(--color-accent)` with an offset.
- **Semantic HTML**: Standard wrappers (header, nav, main, section, footer) must be utilized for screen reader support.
