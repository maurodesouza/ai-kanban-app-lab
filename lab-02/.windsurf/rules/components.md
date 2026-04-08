---
trigger: always_on
description: Component composition rules for the project
---

# Component Composition Rules

All UI components must follow a strict composition and export pattern.

---

### Export Pattern (MANDATORY)

Components must NOT be exported individually.

Always export them as a grouped object:

```ts
export const ComponentName = {
  Root,
  SubComponent,
  AnotherPart,
};
````

#### Usage

```tsx
<ComponentName.Root />
<ComponentName.SubComponent />
```

---

### Naming

* The exported object name must represent the component domain:

  * `Clickable`
  * `Text`
  * `Field`

* Internal parts must use clear names:

  * `Button`, `Link`, `Heading`, `Container`, etc.

---

### Component Structure

Inside each component file:

1. Imports
2. Variant definitions (if any)
3. Types
4. Main components
5. Subcomponents
6. Final export object

---

### Props & Types

* Use `React.ComponentProps<"element">` when extending native elements
* Combine with `VariantProps` when needed
* Avoid manual duplication of HTML props

---

### Forward Ref Usage

- Do NOT use `React.forwardRef` by default
- `twx` already handles refs automatically

Use `forwardRef` ONLY when necessary:

- When supporting dynamic element rendering via `as` prop
- When polymorphism is required (e.g., h1, h2, h3)
- When `twx` cannot properly handle the typing

Avoid unnecessary use of `forwardRef`

---

### Composition Rules

* Components should be composable and reusable
* Prefer composition over props explosion
* Use `asChild` pattern when needed

---

### Example Pattern

```ts
const Button = ...
const Link = ...
const ExternalLink = ...

export const Clickable = {
  Button,
  Link,
  ExternalLink,
};
```

---

### Consistency Rules

* Do not export components outside the main object
* Do not mix export patterns
* Always follow the same structure across all components

---

### Component Design Rules

- Default to Server Components
- Use "use client" only when necessary:
  - state
  - effects
  - event handlers

### General Principles

* Keep components small and focused
* Separate variants from structure
* Prefer readability over abstraction
