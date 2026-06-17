---

trigger: always_on
description: Defines the allowed technology stack and its boundaries
--------------------------------------------------------------------

# Tech Stack Rules

This project uses a fixed and controlled technology stack.

Only the tools defined here are allowed.

---

## Core Stack

* Next.js (App Router)
* TypeScript (strict mode)
* TailwindCSS
* shadcn/ui
* React Hook Form
* Zod

---

## Constraints

* Do NOT introduce alternative libraries without explicit instruction
* Do NOT duplicate responsibilities across libraries
* Each concern must have a single source of truth

---

## Responsibility Mapping

Each tool has a clear role:

* **Next.js** → application framework
* **TypeScript** → typing system
* **TailwindCSS** → styling system
* **shadcn/ui** → base UI components
* **React Hook Form** → form state
* **Zod** → validation

---

## Styling Constraints

* TailwindCSS is the only styling system allowed

* Do NOT use alternative styling systems:

  * CSS Modules
  * Styled Components
  * Emotion
  * Inline CSS files

* Auxiliary tools within Tailwind are allowed:

  * class composition (e.g., `cn`, `clsx`, `tailwind-merge`)
  * variant systems (e.g., `tailwind-variants`)
  * component composition helpers (e.g., `twx`)

---

## Integration Rules

* Forms → React Hook Form + Zod
* Validation → Zod only

---

## Prohibited

* Do NOT use multiple libraries for the same purpose
* Do NOT introduce parallel abstractions for existing solutions
* Do NOT bypass defined tools without clear justification

---
