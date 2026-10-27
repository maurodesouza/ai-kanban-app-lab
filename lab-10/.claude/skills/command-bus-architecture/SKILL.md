---
name: command-bus-architecture
description: The mandatory application architecture - every interaction is a Command Bus action, all state and derived values live in MobX stores, all execution logic lives in Handles, components only read and present. Use before planning, implementing or reviewing any application code.
---

# User Input

```text
$ARGUMENTS
```

# Objective

Define how application code must be written in this project.

This skill is the source of truth for architecture decisions made by `epic-plan-execution`, `epic-execution`, `command-handle-implementation`, `test-writer` and `reviewer`.

The Command Bus used is **V2** (installed by `setup-command-system`). Do not use V3.

# 1. Core Rules

1. **Everything is an event.** Every application interaction is an action dispatched through the Command Bus and handled by a Handle.
2. **Stores hold all state and all derived values.** Every `computed` lives in a MobX store. There is no derived logic outside stores.
3. **Handles hold all execution logic.** Every decision, validation, request, side effect and orchestration lives in a Handle.
4. **Components only read and present.** Components read values already prepared by the store and dispatch actions. They do not calculate, derive or choose what to show.

| Layer | Responsible for |
| --- | --- |
| MobX Store | All state, all derived values / `computed`, preparing every value the UI presents |
| Handle (Command Bus) | All execution logic, event processing, operations, state changes |
| Component | Reading store values and presenting them |

# 2. What Goes Through the Command Bus

Absolutely everything, including:

| Interaction | Example action |
| --- | --- |
| Open / close modal | `modal.open`, `modal.close` |
| Open / close drawer | `drawer.open`, `drawer.close` |
| Notifications | `notification.show`, `notification.dismiss` |
| Navigation | `navigation.go`, `navigation.back` |
| Forms | `<domain>.form.submit`, `<domain>.form.reset` |
| Requests | `<domain>.fetch`, `<domain>.create`, `<domain>.update`, `<domain>.delete` |
| Toggles | `<domain>.<thing>.toggle` |
| Any other interaction | `<domain>.<verb>` |

If a component needs something to happen, it dispatches an action. It never does it itself.

# 3. Actions

* Declared in `<domain>-actions.ts`, next to the `<domain>-handle.tsx`, through module augmentation of `#/lib/command/global`.
* `Action` for global actions, `ScopedAction` for instance-specific actions.
* Never edit the global `Actions` interface directly.

# 4. Store (MobX)

The store holds **all state** and **all derived values**. It holds **no execution logic**.

## Structure

Organize the class in this order, with `#region` blocks:

1. `Primitives` - observable state fields.
2. `Actions` - setters.
3. `Derived primitives` - small `$` getters over primitives.
4. `Data` - `$` getters that shape data (lists, aggregates, series).
5. `UI` - one `$<part>UI` getter per component/part, returning everything that part presents.

Always call `makeAutoObservable(this, {}, { autoBind: true })` in the constructor.

## Naming: `$` prefix

**Every derived value starts with `$`**: `$` + name.

`$isVisible`, `$title`, `$description`, `$buttonLabel`, `$hasData`, `$status`, `$toggleUI`.

Primitives and setters never start with `$`.

## Allowed

* Observable primitive fields.
* Setters that only assign (`setX(x) { this.x = x }`), push, update or reset state.
* `$` getters computing any derived value, including all presentation values (texts, labels, variants, flags, formatted values, statuses, lists ready to render).
* Pure helper functions imported from `utils/` (written with `utils-implementation`) and used inside `$` getters (formatting, math, mapping).

## Forbidden

* API calls or any async work.
* Dispatching actions.
* Side effects (timers, storage, navigation, notifications, logging).
* Coordinating multiple state changes based on business rules inside setters (e.g. "if start > end then move end"). That decision belongs to the Handle, which calls the setters.
* Calling other stores.

## Example

```typescript
// src/features/settings/store/store.ts
import { makeAutoObservable } from "mobx";

export class SettingsStore {
  // #region Primitives
  isNotificationsEnabled = false;
  // #endregion

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true });
  }

  // #region Actions
  setIsNotificationsEnabled(value: boolean) {
    this.isNotificationsEnabled = value;
  }
  // #endregion

  // #region UI
  get $notificationsToggleUI() {
    const enabled = this.isNotificationsEnabled;

    return {
      checked: enabled,
      label: enabled ? "Notifications on" : "Notifications off",
      description: enabled
        ? "You will receive updates about your boards."
        : "You will not receive any updates.",
      buttonLabel: enabled ? "Disable" : "Enable",
    };
  }
  // #endregion
}

export const settingsStore = new SettingsStore();
```

## Global vs scoped stores

* Global store: export a single instance (`export const settingsStore = new SettingsStore()`) and a `use-<feature>.ts` hook that returns it.
* Scoped store (one per instance): create it once in the feature Provider (`useMemo(() => new Store(), [])`), expose it through context, read it with `use-<feature>.ts` which throws when used outside the Provider. The store exposes its `id`, used as `instanceId` for scoped actions.

# 5. Handle

The Handle holds all execution logic. Implement it with `command-handle-implementation`.

* Calls APIs.
* Validates and decides.
* Changes state only through store setters.
* Dispatches other actions through the `actions` proxy (e.g. `actions.notification.show(...)` after a failed request).
* Handles errors: a failure becomes store state or another action, never an exception thrown to the component.
* Sets loading primitives in the store (`try` / `finally`) when the UI presents a loading state.

```typescript
// src/features/settings/components/handles/settings/settings-handle.tsx
export function SettingsHandle() {
  const store = useSettings();

  async function handleToggleNotifications() {
    const next = !store.isNotificationsEnabled;

    store.setIsNotificationsEnabled(next);

    try {
      await api.settings.update({ notifications: next });
    } catch {
      store.setIsNotificationsEnabled(!next);
      actions.notification.show({ type: "error", message: "Could not save settings" });
    }
  }

  useEffect(() => {
    const disposes = [
      command.handle("settings.notifications.toggle", handleToggleNotifications),
    ];

    return () => {
      for (const dispose of disposes) dispose();
    };
  }, []);

  return null;
}
```

Handles are mounted once, as high as their context requires (app root for shared domains, feature root for feature domains, inside the Provider for scoped domains).

# 6. Component

A component only reads and presents.

* Built with Fragiola UI (`fragiola-ui`).
* Wrapped with `observer` from `mobx-react-lite`.
* Gets the store through `use-<feature>.ts`.
* Destructures its `$<part>UI` getter and renders the values as they are.
* Dispatches through `actions`.

Forbidden in components:

* Calculations, formatting, filtering, sorting, mapping data into new values.
* Conditionals that choose texts, labels, variants or values from state (`enabled ? "On" : "Off"`).
* `useMemo` / derived values / `computed`.
* API calls, business logic, store mutation.
* `useState` for application state (purely ephemeral visual state, such as hover, may stay local).

Conditional rendering is allowed only on a flag or status already prepared by the store (`if (!ui.isVisible) return null`, `switch (ui.status)`).

```typescript
// ✅ Correct
export const NotificationsToggle = observer(() => {
  const store = useSettings();
  const { checked, label, description, buttonLabel } = store.$notificationsToggleUI;

  return (
    <Toggle
      checked={checked}
      label={label}
      description={description}
      buttonLabel={buttonLabel}
      onClick={() => actions.settings.notifications.toggle()}
    />
  );
});
```

```typescript
// ❌ Wrong - the component derives presentation values from state
export const NotificationsToggle = observer(() => {
  const store = useSettings();
  const label = store.isNotificationsEnabled ? "Notifications on" : "Notifications off";

  return <Toggle label={label} />;
});
```

# 7. File Structure

```text
src/features/<feature>/
├── store/
│   ├── store.ts                       # MobX store
│   └── store.test.ts                  # tests for $ derived values
├── hooks/
│   └── use-<feature>.ts               # returns the store
├── utils/                             # pure helpers used by $ getters
└── components/
    ├── handles/<domain>/
    │   ├── <domain>-actions.ts        # action declarations (module augmentation)
    │   └── <domain>-handle.tsx
    └── ...                            # observer components
```

Shared application domains (modal, drawer, notification, navigation) follow the same shape: `src/components/handles/<domain>/` for actions + Handle, `src/store/<domain>/store.ts` for the store and `src/hooks/use-<domain>.ts` for the hook.

A domain without state has no store. Do not create a store without observable state.

# 8. Loading State

* When the UI presents a loading state, the Handle sets a loading primitive in the store and the store exposes it through `$status` / `$<part>UI`.
* `useTransition` is only used where no store value is involved, e.g. disabling the button that dispatched the action.

# 9. Dispatching

* Use the `actions` proxy: `actions.domain.action(payload)`.
* Scoped: `actions.domain.action(payload, { instanceId: store.id })`.
* `command.dispatch()` only for external triggers (realtime, WebSocket, server events, AI/tool triggers).

# 10. Prerequisites

* If `src/lib/command/` does not exist, run `setup-command-system` first.
* If `mobx` / `mobx-react-lite` are not installed, install them (verify versions with `epic-current-documentation`). MobX is part of this architecture and is pre-approved.

# 11. Checklist

* [ ] Every interaction is an action handled by a Handle.
* [ ] All state lives in MobX stores.
* [ ] All derived values / `computed` live in stores; none in components, hooks or Handles.
* [ ] Every derived value starts with `$`.
* [ ] Each component reads a prepared `$<part>UI` (or `$` value) and does no calculation or value selection.
* [ ] Stores contain no execution logic (no async, no API, no dispatch, no side effects, no business decisions in setters).
* [ ] Stores follow the region order and use `makeAutoObservable(this, {}, { autoBind: true })`.
* [ ] Components reading stores are `observer`.
* [ ] Errors are handled in Handles (state or `notification.show`).
* [ ] Actions declared via module augmentation.
* [ ] Dispatch uses the `actions` proxy.
* [ ] Handles dispose every registration on unmount.
