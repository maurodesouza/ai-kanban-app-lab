---
trigger: always_on
description: Headless composition architecture rules
---

# Component Architecture Rules

All UI components must follow a headless composition architecture.

The consumer is responsible for assembling the UI.

Components expose primitives only.

## Core Principle

Components must expose building blocks.

Components must NOT assemble their own domain structure.

The consumer must compose the UI.

## Export Pattern (MANDATORY)

Never export components individually.

Always export grouped objects.

```ts
export const Kanban = {
  Provider,
  Container,
  Header,
  Content,
  Column,
  Task,
};
```

Nested domains must also be grouped.

```ts
export const Kanban = {
  Column: {
    Container,
    Header,
    Content,
    Footer,
    Title,
  },

  Task: {
    Container,
    Header,
    Footer,
    Title,
    DeleteAction,
    EditAction,
  },
};
```

## Headless Composition (MANDATORY)

Components must NOT orchestrate their own UI structure.

Forbidden:

```tsx
function Column() {
  return (
    <ColumnContainer>
      <ColumnHeader />
      <ColumnContent />
      <ColumnFooter />
    </ColumnContainer>
  );
}
```

Forbidden:

```tsx
function Task() {
  return (
    <TaskContainer>
      <TaskHeader />
      <TaskFooter />
    </TaskContainer>
  );
}
```

Allowed:

```tsx
<Kanban.Column.Container>
  <Kanban.Column.Header />
  <Kanban.Column.Content />
  <Kanban.Column.Footer />
</Kanban.Column.Container>
```

The consumer owns the composition.

## No Feature Components

Do not create components that represent a fully assembled feature.

Forbidden:

```tsx
<Kanban />
<Column />
<Task />
<UserCard />
<ProductCard />
```

These components hide composition and reduce flexibility.

Instead expose primitives.

Allowed:

```tsx
<UserCard.Container>
<UserCard.Header>
<UserCard.Avatar>
<UserCard.Content>
<UserCard.Footer>
```

## Primitive Components Only

Each component should have a single responsibility.

Examples:

```tsx
Container
Header
Content
Footer
Title
Description
Action
Icon
Input
Label
```

Avoid components that combine multiple responsibilities.

Forbidden:

```tsx
TaskCard
ColumnView
KanbanBoard
UserProfileCard
```

## Root Components

Root components must be structural primitives.

They must NOT render other parts of the same domain.

Forbidden:

```tsx
function Root() {
  return (
    <>
      <Header />
      <Content />
      <Footer />
    </>
  );
}
```

Allowed:

```tsx
function Container(props) {
  return <div {...props} />;
}
```

## Data Components

Components may fetch data or read context.

However they must render only their own concern.

Allowed:

```tsx
function Title({ taskId }) {
  const task = useTask(taskId);

  return <span>{task.title}</span>;
}
```

Forbidden:

```tsx
function Task({ taskId }) {
  const task = useTask(taskId);

  return (
    <Container>
      <Header />
      <Footer />
    </Container>
  );
}
```

## Consumer Composition

Preferred:

```tsx
<Kanban.Column.Container>
  <Kanban.Column.Header>
    <Kanban.Column.Title />
  </Kanban.Column.Header>

  <Kanban.Column.Content>
    <Kanban.Tasks />
  </Kanban.Column.Content>

  <Kanban.Column.Footer>
    <Kanban.Column.AddTaskAction />
  </Kanban.Column.Footer>
</Kanban.Column.Container>
```

The consumer must assemble the UI tree.

## Component Structure

1. Imports
2. Variants
3. Types
4. Primitive Components
5. Export Object

## Props & Types

Use:

```ts
React.ComponentProps<"div">
React.ComponentProps<"button">
React.ComponentProps<"input">
```

Avoid duplicating native props.

## Forward Ref Usage

Do not use React.forwardRef by default.

Use only when:

* polymorphism is required
* dynamic `as` rendering is required
* typing cannot be inferred

## Server Components

Default to Server Components.

Use "use client" only when necessary.

Examples:

* state
* effects
* event handlers

## General Principles

* Composition over configuration
* Primitives over feature components
* Consumer owns structure
* Components expose capabilities
* Avoid UI orchestration inside components
* Prefer readability over abstraction
