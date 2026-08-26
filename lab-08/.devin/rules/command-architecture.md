---
trigger: always_on
description: Use this rule when implementing command-driven architecture in the application.
---

# Command Architecture

## Overview

The command system is located in `/src/lib/command/`.

This is the standard pattern for application commands and actions.

### Rules

* `domain-handle` and `domain-actions` belong together in the same domain/subdomain folder.
* Global `Actions` must remain empty. **Do not add application-specific actions directly to the global interface. Extend it through module augmentation from the feature/domain that owns the action.**
* `command` and `actions` are already instantiated as singletons. **Never create new instances.**
* Use `ScopedAction` when an action belongs to a specific instance/context.
* Use `Action` when an action is global.
* Register handlers through Handle components.
* Always dispose registered handlers when the Handle unmounts.
* **Prefer dispatching through the `actions` proxy.**
* **Direct `command.dispatch()` should only be used when the event arrives from an external/realtime/AI trigger and there is no `actions` proxy context available.**

## Good to Know

### Dispatching Commands

Commands are normally dispatched through the `actions` proxy:

```typescript
actions.domain.action(payload);
```

For scoped actions, provide the instance/context required by the action.

```typescript
actions.domain.action(payload, { instanceId: "instance-1" });
```

### Direct Dispatch

`command.dispatch()` is an exception to the normal dispatching pattern.

Use it only when a command is triggered by an external event where there is no natural `actions` proxy call, such as:

* realtime events
* WebSocket events
* server events
* AI/tool triggers
* other external event sources

Example:

```typescript
command.dispatch("chat.messages.receive", payload); // Global
command.dispatch("chat.messages.receive", payload, { instanceId: "instance-1" }); // Scoped
```

Do **not** use direct dispatch simply because it is shorter or more convenient. Application code should normally dispatch through the `actions` proxy.

### Transitions Store

Use `useTransition` to track asynchronous command execution:

```typescript
const isLoading = useTransition(["my", "key"]);
actions.domain.action(payload, { transition: ["my", "key"] });
```

### Instance Registry

Use the Instance Registry when the application needs to discover existing instances of a domain.

For example, if multiple pipelines can be mounted at the same time:

```typescript
const registry = InstanceRegistry.getInstance();
const pipelines = registry.getInstances("pipeline");
```

The registry can be used when another part of the application needs to discover which instances currently exist.

Example result:

```typescript
[
  { id: "pipeline-1", label: "Main Pipeline" },
  { id: "pipeline-2", label: "Secondary Pipeline" },
]
```

**Do not use the Instance Registry for normal command dispatching.** It is for instance discovery/integration, not for replacing the `actions` proxy.

## Implementation Checklist

* [ ] Define the context.
* [ ] Create the domain/subdomain folder containing `domain-actions.ts` and `domain-handle.tsx`.
* [ ] Define the action types.
* [ ] Register handlers in the Handle.
* [ ] Dispatch commands through the `actions` proxy.
* [ ] Use direct `command.dispatch()` only for external/realtime/AI triggers.
* [ ] Use `useTransition` for asynchronous state when needed.
* [ ] Use the Instance Registry for instance discovery when needed.

## 1. Defining the Context

The context determines **where the command belongs** and **which instances it controls**.

Ask: *Who owns or uses this context?*

### Shared application context

If the context is generic and can be used anywhere, place it under:

```text
src/components/handles/<domain>/
```

Example:

```text
src/components/handles/modal/
```

A modal is a shared application concept.

### Feature context

If the context belongs to an application feature, place it under:

```text
src/features/<feature>/components/handles/<domain>/
```

Example:

```text
src/features/chatbot/components/handles/messages/
```

The chatbot is globally accessible, but it is still a feature of the application.

### Instance-specific context

If multiple independent instances can exist simultaneously, the context belongs to the feature/domain that owns those instances.

Example:

```text
src/features/dashboard/components/handles/filters/
```

Multiple dashboards can exist on the screen, so their commands may require a scoped instance.

## 2. Defining Actions

### Scoped Action

Use `ScopedAction` when the command operates on a specific instance/context.

```typescript
// /src/features/pipeline/types.ts

import type { ScopedAction } from "#/lib/command";

export type AddPipelinePayload = {};

declare module "#/lib/command/global" {
  interface Actions {
    pipeline: {
      add: ScopedAction<AddPipelinePayload>;
    };
  }
}
```

### Global Action

Use `Action` when the command does not belong to a specific instance.

```typescript
// /src/features/modal/types.ts

import type { Action } from "#/lib/command";

export type OpenModalPayload = {};

declare module "#/lib/command/global" {
  interface Actions {
    modal: {
      open: Action<OpenModalPayload>;
      close: Action;
    };
  }
}
```

**Do not modify the global action interface directly. Extend it through module augmentation.**

## 3. Defining a Handle

A Handle is responsible for registering commands and executing their application logic.

Handler functions are defined inside the component, while registration happens inside `useEffect`.

```typescript
export function CanvasHandle() {
	const [Content, setContent] = useState()

  function handleOpenModal(payload: OpenModalPayload) {
    // implementation
  }

  useEffect(() => {
	const config = { instanceId }

    const disposes = [
      command.handle("modal.open", handleOpenModal),
    ];

    return () => {
      for (const dispose of disposes) dispose();
    };
  }, []);

  return (
	<Modal>
		{Content}
	</Modal>
  ) ;
}
```

Scoped example

```typescript
export function CanvasHandle() {
	const { instanceId } = useContext()

  function handleAddPipeline(payload: AddPipelinePayload) {
    // implementation
  }

  useEffect(() => {
	const config = { instanceId }

    const disposes = [
      command.handle("pipeline.add", handleAddPipeline, config),
    ];

    return () => {
      for (const dispose of disposes) dispose();
    };
  }, [instanceId]);

  return null;
}
```

Rules:

* Handler functions stay outside `useEffect`, my inside of the `component`.
* `command.handle()` is called inside `useEffect`.
* Store every returned dispose function.
* Dispose every handler on unmount.
* A Handle may register multiple related commands.

## Final Check

Before implementing a command:

* Is the context correctly scoped?
* Should the action be `Action` or `ScopedAction`?
* Does the action belong to a domain/feature rather than global code?
* Is there already an existing `command` and `actions` instance?
* Does the handler have proper cleanup?
* Should this use the `actions` proxy?
* Is direct dispatch justified by an external/realtime/AI trigger?
* Does the UI need a transition state?
* Does the application actually need instance discovery?
