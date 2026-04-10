---
trigger: always_on
description: How the styling system works in this project and how to use it correctly.
---

# Objective

Define how styling works in this project using a **token-based, context-driven system**.

---

## Core Concepts

The project uses:

* Tailwind CSS v4 as utility engine
* CSS variables as design tokens
* Theme classes (`.theme-dark`, `.theme-light`)
* Context classes:

  * `base-*` → neutral tokens
  * `tone` → enables tone tokens
  * `palette-*` → injects color into tone

---

## File Structure

```
src/styles/
  global.css
  themes/
    index.css
    light.css
    dark.css
```

---

## Global Styling (`global.css`)

Responsible for:

* Importing Tailwind
* Importing themes
* Defining tokens via `@theme inline`
* Base resets

---

## Themes

Themes override token values:

```css
.theme-dark .base-1 {
  --background-base: ...;
  --foreground: ...;
}
```

Switching theme changes **all tokens globally**.

---

## Token System

Tokens are **not global values**.
They are **scoped by DOM context**.

---

## Context Layers

### 1. Base (`base-*`)

Populates **neutral tokens**:

  -background-base;
  -background-support;

  -foreground-min;
  -foreground;
  -foreground-max;

  -ring-inner;
  -ring-outer;

```tsx
<div className="base-1 bg-background-base text-foreground border border-ring-inner">
  Content
</div>
```

Variants:

* `base-1` → primary surface
* `base-2` → secondary surface

---

### 2. Tone (`tone`)

Activates tone-related tokens.

Populates:

  -tone-contrast-100: var(--tone-100);
  -tone-contrast-200: var(--tone-200);
  -tone-contrast-300: var(--tone-300);
  -tone-contrast-400: var(--tone-400);
  -tone-contrast-500: var(--tone-500);

  -tone-luminosity-100: var(--tone-100);
  -tone-luminosity-200: var(--tone-200);
  -tone-luminosity-300: var(--tone-300);
  -tone-luminosity-400: var(--tone-400);
  -tone-luminosity-500: var(--tone-500);

  -tone-ring-inner: var(--tone-300);
  -tone-ring-outer: var(--tone-100);

  -tone-foreground-contrast: var(--tone-contrast);
  -tone-foreground-context: var(--tone-300);

```tsx
<div className="tone">
  ...
</div>
```

Alone, it does nothing visually.
It only enables the token layer.

---

### 3. Palette (`palette-*`)

Defines **which colors fill tone tokens**.

```tsx
<div className="tone palette-brand">
  ...
</div>
```

Now the tone tokens are populated with the brand colors.

---

## How It Works Together

```tsx
<div className="base-1 bg-background-base">
  <button className="tone palette-success bg-tone-luminosity-500 text-tone-foreground-contrast px-md py-xs rounded-md">
    Success
  </button>
</div>
```

* `base-1` → defines neutral environment
* `tone` → enables tone tokens
* `palette-success` → injects color into tone

---

## Token Scope (CRITICAL)

Tokens are inherited through DOM.

### Base override

```tsx
<div className="base-1">
  <div className="base-2">
    ...
  </div>
</div>
```

* Inner context overrides outer context

---

### Tone override

```tsx
<div className="tone palette-brand">
  <div className="tone palette-danger">
    ...
  </div>
</div>
```

To change tone:

* You MUST redeclare `tone`
* You MUST redefine `palette-*`

---

## Key Rule

There is no implicit behavior.

* Tokens do not “switch”
* Context must be explicitly redefined
* Everything is driven by DOM hierarchy

---

## Changing Palette (Local)

```tsx
<button className="tone palette-success ...">
  Success
</button>

<button className="tone palette-danger ...">
  Error
</button>
```

Only tone colors change.

---

## Changing Base (Local)

```tsx
<div className="base-1">...</div>
<div className="base-2">...</div>
```

Only neutral surfaces change.

---

## Changing Theme (Global)

```tsx
<body className="theme-dark">
  <App />
</body>

<body className="theme-light">
  <App />
</body>
```

Updates:

* Base tokens
* Palette tokens
* Tone tokens

Entire UI adapts.

---

## Using Tokens in Tailwind

Use tokens through utility classes:

```tsx
<div className="base-1 bg-background-base text-foreground">
  Content
</div>
```

Never use raw values.

---

## Component Usage

### Variant-based

```tsx
<Clickable.Button tone="brand" variant="solid">
  Click
</Clickable.Button>
```

---

### Inline usage

```tsx
<button className="tone palette-brand bg-tone-luminosity-500 text-tone-foreground-contrast px-md py-xs rounded-md">
  Action
</button>
```

---

## Best Practices

* Never use raw colors (hex, rgb, etc.)
* Always define layout using `base-*`
* Always define color using `palette-*`
* Always use `tone` when working with palette
* Treat tokens as the single source of truth

---

## When to Use

* Complex UI systems
* Multiple themes
* Reusable components with variants

---

## When NOT to Use

* Very simple apps
* No need for theming
* Static UI

---

## Final Mental Model

* `base-*` → defines neutral token context
* `tone` → enables tone token layer
* `palette-*` → injects color into tone tokens
* `theme-*` → overrides everything globally

Everything is context.
Nothing is implicit.
