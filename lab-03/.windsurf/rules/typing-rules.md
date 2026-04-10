---
trigger: always_on
description: Typing rules for components and general TypeScript usage
---

# Typing Rules (Components and General)

### General Principles

* Always prefer `type` over `interface`
* Use `interface` **only** for class definitions
* Always use **named exports** for all types
* Do not create redundant types for things that already have built-in or existing types

---

### Component Typing

* Never use inline typing for component props
* Only create a props type **if the component actually has props**
* When needed, always declare props using:

```ts
type ComponentNameProps = {
  // props here
};
```

* The props type **must be placed directly above** the component, separated by one blank line

```ts
type TaskTitleProps = {};

function TaskTitle(props: TaskTitleProps) {
  return <Text.Paragraph />;
}
```

---

### Children Handling

* Do not manually type `children`
* Always use `React.PropsWithChildren`

```ts
function ComponentName(props: React.PropsWithChildren) {
  return <Text.Paragraph>{props.children}</Text.Paragraph>;
}
```

* When additional props exist:

```ts
type ComponentNameProps = {
  myProp: string;
};

function ComponentName(
  props: React.PropsWithChildren<ComponentNameProps>
) {
  return <Text.Paragraph>{props.children}</Text.Paragraph>;
}
```

---

### Composition (Multiple Components in Same File)

* Only create `ComponentNameProps` **if the component needs props**
* Do not create empty or unnecessary types
* Keep each type **close to its respective component**
* The type must be placed **immediately above the component**, separated by one blank line
* Do not centralize component props types in a separate file

---

### Reusing Existing Types

* When deriving props from another component, use:

```ts
React.ComponentProps<typeof MyComponent>
```

* Avoid recreating or duplicating existing types

---

### Project Structure for Types

* Helper types → `src/types/helpers.ts`
* Entity or reusable domain types → `src/types/<entity-name>.ts`

Examples:

```
src/types/helpers.ts
src/types/task.ts
src/types/user.ts
```

* Always use **named exports**:

```ts
export type Task = {
  id: string;
};
```

---

### Summary

* `type` everywhere, `interface` only for classes
* No inline props typing
* Create `ComponentNameProps` only when needed
* Props type stays above the component
* Use `React.PropsWithChildren` for children
* Reuse types instead of recreating
* Organize shared types under `src/types`
* Always use named exports
