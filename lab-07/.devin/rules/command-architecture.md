---
trigger: always_on
description: Use this rule when implementing command-driven architecture in the application.
---

# Command Architecture Rule

## Overview

This project uses a **command-based pattern** to centralize all application actions behind a single `actions` object with nested domains and strong observability. The system is framework-agnostic and can be invoked from anywhere (React components, JS modules, stores, etc.).

## Rule Scope

This is the official and only allowed pattern for command-driven communication in the project.

### Key Components

1. **Command System** (`/src/lib/command/`)
2. **Action Types** (`/src/lib/command/types.ts`)
3. **Global Actions** (`/src/lib/command/global.ts`)
4. **Command Bus** (`/src/lib/command/command-bus.ts`)
5. **Transitions Store** (`/src/lib/command/transitions-store.ts`)
6. **Instance Registry** (`/src/lib/command/instance-registry.ts`)

---

## 1. Defining Actions

### Global Actions

Define global action types in `src/lib/command/global.ts`:

```typescript
import type { Action, ScopedAction } from "./types";

export interface Actions {
    counter: {
        increment: Action;
        decrement: Action;
        reset: Action;
    };

    content: {
        show: ScopedAction<string>;
    };
}
```

- **Action**: Global command, no instance required
- **ScopedAction**: Instance-scoped command, requires `instanceId` at registration and dispatch

### Feature-Specific Actions (Optional)

For better organization, define action types within feature folders using module augmentation:

```typescript
import type { ScopedAction } from "#/lib/command/types";

declare module "#/lib/command/global" {
    interface Actions {
        pipeline: {
            save: ScopedAction<PipelineData>;
        };
    }
}
```

## 2. Instantiation

Create a single instance of the command system and export `command` and its `actions` proxy from `src/lib/command/index.ts`.

## 3. Handles

Handlers must be registered through dedicated React Handle components. A Handle connects one or more commands to application logic.

Global handles belong in `src/components/handles/<handle-name>/<handle-name>.tsx`. Feature handles belong in `src/features/<feature>/components/handles/<handle-name>/<handle-name>.tsx`. Do not place Handle components in arbitrary locations.

A Handle must be a React component. Define handler functions inside the component body but outside `useEffect`. The effect is responsible only for registering and disposing handlers. Store every dispose function and dispose every handler on unmount. Return `null` unless the Handle explicitly renders UI.

```typescript
"use client";

import { useEffect } from "react";
import { actions, command } from "#/lib/command";

export function CanvasHandle() {
    async function handleCanvasClear() {
        await actions.panel.right.show("recommended-resources");
    }

    useEffect(() => {
        const disposes = [
            command.handle("canvas.sections.clear", handleCanvasClear),
        ];

        return () => {
            disposes.forEach((dispose) => dispose());
        };
    }, []);

    return null;
}
```

A single Handle may register multiple related commands. Handles may read or update stores, call other actions, validate, coordinate behavior, call parsers or domain utilities, perform asynchronous work, and trigger other commands. Keep UI rendering outside Handles.

For scoped commands, register with the actual `instanceId` handled by the component and include it in effect dependencies. Mount Handles where they remain active for the lifetime of their commands. Do not call `command.handle()` from event handlers, render functions, or arbitrary utility modules.

## 4. Dispatching Commands

Dispatch unscoped commands through the proxy:

```typescript
await actions.counter.increment();
```

Dispatch scoped commands with an instance:

```typescript
await actions.pipeline.nodes.add(payload, { instanceId: "pipeline-1" });
```

Direct dispatch is also supported:

```typescript
await command.dispatch("counter.increment");
```

## 5. Transitions

Use `useTransition` as the source of execution state for loading indicators and disabled UI:

```typescript
import { useTransition } from "#/hooks/use-transition";

const isExecuting = useTransition(["counter.increment"]);
```

Custom transition keys can be supplied in dispatch configuration. The `TransitionStore` may be queried directly outside React.

## 6. Instance Registry

Use `InstanceRegistry.getInstance().getInstances(domain)` to discover registered scoped command instances.

## Checklist

- Define global action types in `src/lib/command/global.ts`.
- Define feature-specific action types using module augmentation when appropriate.
- Register handlers with proper cleanup.
- Use `instanceId` for scoped commands.
- Dispatch commands via the `actions` proxy or `command.dispatch`.
- Use `useTransition` for loading states.
- Use the instance registry for instance discovery when needed.

## Best Practices

1. Always call dispose when a handler is no longer active.
2. Define payload and result types for strong typing.
3. Keep shared actions in `global.ts`.
4. Keep feature-specific declarations close to their feature through module augmentation.
5. Use scoped commands for domain-specific instances.
6. Use unscoped commands for global actions.
7. Track pending execution with transitions.
8. Use the instance registry for instance discovery.
