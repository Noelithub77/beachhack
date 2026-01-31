---
trigger: manual
---

# Minimal Design System

A calm, modern system built for clarity, whitespace, and consistency. Designed specifically for shadcn + Tailwind projects.

---

## Core Principles

* Extreme simplicity
* No emojis
* Standard icons only (Lucide)
* One radius language
* No gradient text — gradients are background-only
* Prefer whitespace over decoration

---

## Color Tokens

```
--sage-900: #6F8551;
--sage-500: #B7CF9A;
--neutral-50: #F4F4F4;
--sand-400: #C3A789;
--earth-700: #7B5E45;
```

### Semantic

```
--background: #F4F4F4;
--foreground: #1C1C1C;
--primary: var(--sage-900);
--secondary: var(--sage-500);
--card: #FFFFFF;
--border: #E4E6E0;
```

---

## Typography (Highly Minimal)

### Primary Font

**Recommendation:** `Geist` 

```
font-family: Geist, Inter, ui-sans-serif, system-ui;
```

### Scale

```
H1 — 32px
H2 — 24px
H3 — 18px
Body — 15–16px
Small — 13px
```

### Rules

* Avoid pure black
* Use weight, not color, for hierarchy
* Slight negative letter spacing on headings (`-0.01em`)

---

## Radius System

Use ONE default everywhere.

```
--radius: 14px;
```

Large containers may use `20–24px`. Nothing else.

---

## Shadow

Soft elevation only.

```
0 6px 18px rgba(0,0,0,0.06)
```

Avoid layered shadows.

---

## Radial Gradient System

### App Background

```css
body {
  background-color: #F4F4F4;
  background-image:
    radial-gradient(circle at 18% 20%, rgba(111,133,81,0.16), transparent 42%),
    radial-gradient(circle at 82% 75%, rgba(195,167,137,0.14), transparent 46%);
}
```

### Rules

* Opacity under `0.20`
* Never animate aggressively
* Keep gradients wide and soft

---

## Layout

```
max-width: 1200px;
padding: 24px;
margin: 0 auto;
```

### Spacing

Stick to an 8px grid.

```
8
16
24
32
48
64
```

---

## Tailwind Extension

```ts
import type { Config } from "tailwindcss"

export default {
  theme: {
    extend: {
      borderRadius: {
        DEFAULT: "14px",
      },
      colors: {
        sage: {
          900: "#6F8551",
          500: "#B7CF9A",
        },
        sand: "#C3A789",
        earth: "#7B5E45",
      },
      backgroundImage: {
        'radial-app': `
          radial-gradient(circle at 18% 20%, rgba(111,133,81,0.16), transparent 42%),
          radial-gradient(circle at 82% 75%, rgba(195,167,137,0.14), transparent 46%)
        `,
      },
    },
  },
} satisfies Config
```

---

## shadcn Styling Defaults

### Card

```
bg-white
border
rounded-[14px]
shadow-sm
```

### Button (Primary)

```
bg-sage-900
text-white
rounded-[14px]
hover:opacity-90
transition-all duration-200 ease-out
```

### Input

```
rounded-[14px]
border
focus:ring-2 focus:ring-sage-900/20
```

---

## Icons

* Library: **Lucide**
* Size: `18–20px`
* Stroke: `1.5–2`
* Never mix icon sets

---

## Hard Rules

**Do**

* Reduce visual noise
* Keep surfaces flat
* Design for breathing room

**Do Not**

* Gradient text
* Glassmorphism
* Neon colors
* Heavy borders
* Over-animation

---

## Visual Direction

Quiet. Mature. Architectural.

The interface should feel effortless — almost invisible.
