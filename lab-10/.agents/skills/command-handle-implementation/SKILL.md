---
name: command-handle-implementation
description: Implement command handles for the current feature
---

# Command Handle Implementation

## When to use

Use this skill whenever you need to create or modify a command Handle — the component responsible for registering `command.handle()` listeners.

This includes:

- Creating a new Handle.
- Adding an action to an existing Handle.
- Refactoring an existing Handle.

Do not use this skill for general command architecture questions or command dispatching. Follow the `command-bus-architecture` skill instead.

If `src/lib/command/` does not exist, invoke the `setup-command-system` skill before implementing the Handle.

## Before implementation

1. Identify the domain/feature that owns the Handle.
2. Confirm whether the action is `Action` or `ScopedAction`.
3. Check whether the action declaration already exists.
4. Check whether a Handle already exists for the domain.

Do not change the action scope or architecture merely to simplify the implementation.

## File structure

Shared application context:

```text
src/components/handles/<domain>/
├── <domain>-actions.ts
└── <domain>-handle.tsx
```

Feature context:

```text
src/features/<feature>/components/handles/<domain>/
├── <domain>-actions.ts
└── <domain>-handle.tsx
```

## Action declarations

If the action is new:

* Declare its type in `<domain>-actions.ts`.
* Extend `#/lib/command/global` through module augmentation.
* Use `Action` for global actions.
* Use `ScopedAction` for instance-specific actions.
* Never modify the global `Actions` interface directly.

If the action already exists, reuse its existing declaration. Do not redeclare it.

## Handle implementation

Handler functions MUST:

* Be defined inside the component.
* Be defined outside `useEffect`.
* Contain the application/orchestration logic.
* Call store mutations when state needs to change.
* Call external APIs when required.
* Dispatch other commands when required.

Example:

```typescript
export function MyHandle() {
  async function handleDoThing(payload: Payload) {
    const result = await api.process(payload);

    myStore.setData(result);
  }

  useEffect(() => {
    const disposes = [
      command.handle("myDomain.doThing", handleDoThing),
    ];

    return () => {
      for (const dispose of disposes) dispose();
    };
  }, []);

  return null;
}
```

## Registration

`command.handle()` MUST:

* Be called inside `useEffect`.
* Receive handlers by reference.
* Receive `{ instanceId }` when registering a `ScopedAction`.
* Return a disposer that is cleaned up.

Do not put handler logic inline:

```typescript
// ❌ Wrong
command.handle("myDomain.doThing", async (payload) => {
  // logic
});
```

Use a named handler instead:

```typescript
// ✅ Correct
async function handleDoThing(payload: Payload) {
  // logic
}

command.handle("myDomain.doThing", handleDoThing);
```

## Cleanup

Store every disposer returned by `command.handle()`.

Dispose every handler when the Handle unmounts.

```typescript
useEffect(() => {
  const disposes = [
    command.handle("domain.action", handleAction),
    command.handle("domain.otherAction", handleOtherAction),
  ];

  return () => {
    for (const dispose of disposes) dispose();
  };
}, []);
```

## Dependencies

Use the correct `useEffect` dependencies.

If handlers close over a stable store reference and dependencies intentionally need to be omitted, use:

```typescript
// biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
```

Always provide a clear reason for the suppression.

## Store and Dispatching

Store rules, the Store/Handle split and dispatching rules are defined in `command-bus-architecture`. In a Handle:

* Change state only through store setters.
* Read derived values from the store (`store.$value`); never compute them in the Handle.
* Dispatch through the `actions` proxy; `command.dispatch()` only for external/realtime/AI triggers.

## Verification

Before finishing:

* [ ] Typecheck and lint pass (repository scripts from `epic-discover-repository`).
* [ ] Handlers are outside `useEffect`.
* [ ] `command.handle()` receives handlers by reference.
* [ ] All disposers are cleaned up.
* [ ] Scoped actions receive the correct `instanceId`.
* [ ] New actions use module augmentation.
* [ ] Existing actions are not redeclared.
* [ ] MobX store contains state, setters and `$` derived values only; no execution logic.
* [ ] The Handle computes no derived values.
* [ ] Normal dispatch uses the `actions` proxy.
* [ ] No unnecessary `command.dispatch()` is used.
