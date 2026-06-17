---
trigger: always_on
description: Styling decision rules for components using tv, twx, and cn
---

# Styling Rules

All component styling must follow a **clear and exclusive decision model**.

---

## Decision Matrix

### 1. Use `tailwind-variants (tv)` when:

* The component exposes variants (tone, size, state, etc.)
* Variants affect styling logic

```ts
const variants = tv({ ... })
```

---

### 2. Use `twx` when:

* The component has no variants
* Styling is static and reusable

```ts
export const Container = twx.div`flex p-md`
```

---

### 3. Use `cn` when:

* Wrapping or extending external components (Radix, Next, etc.)
* You only need class merging
* No internal styling system is required

```tsx
<DialogPrimitive.Content className={cn("base-styles", className)} />
```

---

### 4. Mixed usage (`tv` + `cn`) is allowed when:

* Part of the component is variant-driven
* Part of the component is structural/layout

**Rule:**

* `tv` → dynamic/variant styling
* `cn` → layout or container composition

```tsx
<div className={cn("layout", className)}>
  <div className={variants(props)} />
</div>
```

---

## Hard Constraints

* Do NOT use raw inline Tailwind classes in reusable components
* Do NOT mix styling strategies arbitrarily
* Each component must follow exactly one decision path (or the defined mixed case)

---

## Mental Model

* `tv` → controls variation
* `twx` → defines static structure
* `cn` → composes or extends externally

No implicit behavior.
Choose the correct path based on component responsibility.
