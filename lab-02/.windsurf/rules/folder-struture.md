---
trigger: always_on
description: Project structure rules for Next.js applications
---

# Project Structure Rules (Next.js)

You must follow this file and folder organization strictly.

---

## Root Structure

All source code must be inside the `src/` folder:

* src/

  * app/
  * components/
  * hooks/
  * lib/
  * utils/
  * styles/
  * config/

---

## Naming Convention

* All files and folders must use **kebab-case**

Examples:

* `login-form.tsx`
* `use-auth.ts`
* `user-service.ts`

---

## Components Structure (Atomic Design)

Global components must follow Atomic Design:

* src/components/

  * atoms/
  * molecules/
  * organisms/
  * templates/
  * handles/
  * helpers/

---

### Component Rules

* Each component must be a folder:

```
components/atoms/button/
  index.tsx
  types.ts (optional)
  helpers.ts (optional)
```

---

### Export Rules

* Main component must be exported from `index.tsx`
* Types must be exported from the same entry
* Avoid deep imports
* Always import from the component root

---

## Local (Route-Level) Components

Inside App Router:

```
app/
  login/
    page.tsx
    _components/
```

### Rules

* `_components` is for route-specific components
* Promote to global only when reused

---

## Hooks

* Located in: `src/hooks/`
* Must start with `use-`

---

## Utils

* Located in: `src/utils/`
* Each util must be a folder:

```
utils/format-date/index.ts
```

### Rules

* Must be pure
* No side effects

---

## Lib

* Located in: `src/lib/`
* Used for:

  * API clients
  * external integrations
  * SDK setup
  * configuration wrappers

---

## Styles

* Located in: `src/styles/`

Structure:

* global.css
* themes/

---

## Import Rules

* Prefer absolute imports (`@/...`)
* Avoid deep relative paths

---

## Guidelines (Non-mandatory)

* Keep components small and modular
* Co-locate related files
* Promote to global only when reused
* Avoid large index aggregators

---
