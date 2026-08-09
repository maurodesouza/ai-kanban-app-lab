---
trigger: always_on
description: Use this rule when implementing command-driven architecture in the application.
---

# Command Architecture Rule

## Overview

All inter-feature communication in this project must go through the `actions`
proxy and the `command` bus. No component or store should directly call
external side effects or mutate another domain.

## Key Components

1. `src/lib/command/index.ts` exports `command` and `actions`.
2. `src/lib/command/types.ts` defines `Action`, `ScopedAction`, `Config` and
   `TransitionKey`.
3. `src/lib/command/global.ts` is the source of truth for global action types.
4. `src/lib/command/command-bus.ts` registers and dispatches handlers.
5. `src/lib/command/transitions-store.ts` tracks command execution state.
6. `src/hooks/use-transition.ts` exposes transition state in React components.

## Defining Actions

Add typed actions to `src/lib/command/global.ts`:

```ts
import type { Action } from './types';

export interface Actions {
    kanban: {
        task: {
            add: Action<{ title: string }>;
        };
    };
}
```

For feature-specific actions, use module augmentation:

```ts
declare module '#/lib/command/global' {
    interface Actions {
        feature: {
            do: Action<string>;
        };
    }
}
```

## Registering Handlers

```ts
import { command } from '#/lib/command';

useEffect(() => {
    const dispose = command.handle('kanban.task.add', async (payload) => {
        // business logic
    });

    return () => dispose();
}, []);
```

## Dispatching Commands

```ts
import { actions } from '#/lib/command';

await actions.kanban.task.add({ title: 'New task' });
```

## Transitions

Track loading state with `useTransition`:

```ts
const isAdding = useTransition(['kanban.task.add']);
```

## Checklist

- [ ] Define action types in `global.ts` or via module augmentation.
- [ ] Register handlers with proper cleanup.
- [ ] Dispatch commands via `actions` or `command.dispatch`.
- [ ] Use `useTransition` for loading UI.
- [ ] Emit `actions.toast.show` after successful actions.
