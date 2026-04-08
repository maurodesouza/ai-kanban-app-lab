---
trigger: model_decision
description: Project structure rules for Next.js
---

# Project Structure Rules (Next.js)

You must follow this file and folder organization strictly.

---

### Root Structure

All source code must be inside the `src/` folder:

- src/
  - components/
  - hooks/
  - lib/
  - utils/
  - app/        (Next.js App Router)
  - styles/
  - config/

---

### Naming Convention

- All files and folders must use **kebab-case**
- Examples:
  - `login-form.tsx`
  - `use-auth.ts`
  - `user-service.ts`

---

### Components Structure (Atomic Design)

Global components must be organized using Atomic Design inside:

- src/components/
  - atoms/
  - molecules/
  - organisms/
  - templates/

#### Rules

- Each component must be a folder:
  - `components/atoms/button/index.tsx`

- A component folder may contain:
  - `index.tsx` (main export)
  - `types.ts` (if needed)
  - `helpers.ts`
  - sub-parts (e.g., `header.tsx`, `hero.tsx`)

#### Example

- components/templates/landing/
  - index.tsx
  - header.tsx
  - hero.tsx
  - links.ts

#### Export Rules

- The main component must be exported from `index.tsx`
- Types must also be exported from the same entry point
- Avoid deep imports; always import from the component root

---

### Local (Route-Level) Components

Inside the App Router:

- app/
  - login/
    - page.tsx
    - _components/

#### Rules

- Use `_components` for components specific to that route
- Do not move them to global `components/` unless reused

---

### Hooks

- Located in: `src/hooks/`
- Must follow naming:
  - `use-auth.ts`
  - `use-form.ts`

- Always prefix with `use`

---

### Utils

- Located in: `src/utils/`
- Each util must be a folder:

  - utils/format-date/index.ts

- Utils must be:
  - pure functions
  - no side effects

---

### Lib

- Located in: `src/lib/`
- Used for:
  - API clients
  - external integrations
  - SDK setup
  - configuration wrappers

---

### Styles

- Located in: `src/styles/`

Structure:

- styles/
  - global.css
  - themes/
    - index.css
    - light.css
    - dark.css

---

### Component Design Rules

- Default to Server Components
- Use `"use client"` only when necessary:
  - state
  - effects
  - event handlers

---

### Import Rules

- Prefer absolute imports (e.g., `@/components/...`)
- Avoid deep relative paths (`../../../`)

---

### General Principles

- Keep components small and modular
- Co-locate related files inside component folders
- Promote components to global only when reused
- Do not create large index files aggregating all components