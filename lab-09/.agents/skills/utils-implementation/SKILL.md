---
name: utils-implementation
description: Write and organize utils (pure helpers for formatting, mapping, filtering, math, parsing, ids, storage) as one namespace object per domain with clear, readable names. Use before creating or changing any util.
---

# User Input

```text
$ARGUMENTS
```

# Objective

Every util is easy to read: looking at the call site tells what it does.

References (read one when unsure of the style):

* `~/me/calculation-pipeline/frontend/src/utils/` and `.../features/pipeline/utils/canvas/index.ts` (style reference only; its `index.ts` file naming is outdated)
* `~/work/me/fe-assignment-react/src/utils/number/number.ts` and `.../features/dashboard/utils/metrics/metrics.ts`

# 1. Reuse First

Before writing a util, check the existing ones (`src/utils/`, `src/features/<feature>/utils/`). Extend a domain namespace that already exists instead of creating a new file or a duplicate function.

# 2. Location

```text
src/utils/<domain>/<domain>.ts                       # generic, used by any feature (array, json, number, random, storage, dev)
src/features/<feature>/utils/<domain>/<domain>.ts    # specific to one feature (board, card, canvas, metrics)
```

* `<domain>` is a singular noun in kebab-case: what the functions operate on.
* Tests live next to it: `<domain>.test.ts`.
* Import with the full path: `#/utils/number/number`. No `index.ts` barrel files.
* No `helpers.ts`, `common.ts`, `misc.ts` or flat `utils/<thing>.ts` files.

# 3. One Namespace per Domain

Each file exports **one object**, named after the domain in camelCase:

```typescript
export const board = { ... };
```

* No loose exported functions (`export function readJSON`).
* Types go to the feature `types`; constants used only by the util stay private at the top of the file (`const EMPTY_VALUE = "-"`).
* A constant other layers need is a member of the namespace (`priority.list`, `priority.default`), not a separate export.

# 4. Group by Intent

Inside the namespace, group members by what they do. The call site must read like a sentence:

| Group | Use | Call site |
| --- | --- | --- |
| `find` | predicates for `.find()` | `cards.find(board.cards.find.byId(id))` |
| `filter` | predicates for `.filter()` | `cards.filter(board.cards.filter.byColumn(columnId))` |
| `map` | transformers for `.map()` | `cards.map(board.cards.map.moveTo(columnId))` |
| `sort` | comparators for `.sort()` | `cards.sort(board.cards.sort.byPriority())` |
| `format` | values → display strings | `number.format.currency(value)` |
| `math` / `aggregate` | calculations | `metrics.math.average(total, days)` |
| `create` | build new entities | `board.cards.create(payload)` |
| `is` / `has` | boolean checks | `priority.is(value)` |
| `to<Thing>` | conversions | `metrics.chart.toSeries(measure)` |

Nest by entity when a domain has several (`canvas.nodes.find.byType`, `canvas.edges.filter.removeIds`).

# 5. Callbacks Are Curried

Predicates, mappers and comparators used in array methods take their arguments first and return the callback:

```typescript
find: {
  byId: (id: string) => (card: Card) => card.id === id,
},
```

```typescript
// ✅ Correct
const card = cards.find(board.cards.find.byId(id));

// ❌ Wrong
const card = cards.find((card) => card.id === id);
const card = findCardById(cards, id);
```

Comparators and mappers without arguments are still factories (`sort.byPriority()`, `map.toOption()`), so every call site has the same shape.

# 6. Naming

* Names describe the result, not the mechanics: `byColumn`, `currency`, `average`, `toSeries`.
* Predicates start with `by` (find/filter) or `is` / `has` (checks).
* No `get`, `handle`, `do`, `util`, `helper` prefixes; no abbreviations.
* The namespace path already gives context: `date.format.short`, not `date.formatDateShort`.

# 7. Function Bodies

* Short members are written inline in the namespace.
* A member longer than a few lines is a named function declared above the namespace and referenced from it:

```typescript
function buildChainFromCanvas(nodes: CanvasNode[], edges: Edge[]): CanvasOperationNode[] {
  // ...
}

export const canvas = {
  chain: {
    build: buildChainFromCanvas,
  },
};
```

* Members reuse each other through the namespace (`number.currency` calls `number.format`).
* Early returns over nested conditionals.
* Explicit return types on members whose result type is not obvious.

# 8. Purity

Utils are pure: same input, same output.

* No store access, no React, no `actions` / `command`, no API calls.
* Platform wrappers (`storage`, `json`, `random`, `dev`) live only in `src/utils/`, swallow platform errors with a safe fallback, and are called from Handles, never from components.
* Utils are used by store `$` getters and by Handles. Components do not call utils; they read prepared `$` values (`command-bus-architecture`).

# 9. Example

```typescript
// src/features/kanban/utils/priority/priority.ts
import type { Priority } from "#/features/kanban/types";

const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];

const META: Record<Priority, { label: string; palette: string }> = {
  low: { label: "Low", palette: "palette-green" },
  medium: { label: "Medium", palette: "palette-orange" },
  high: { label: "High", palette: "palette-danger" },
};

export const priority = {
  list: PRIORITIES,
  default: "medium" as Priority,

  is: (value: unknown): value is Priority => PRIORITIES.includes(value as Priority),

  format: {
    label: (value: Priority): string => META[value].label,
    palette: (value: Priority): string => META[value].palette,
  },

  sort: {
    byWeight: () => (a: Priority, b: Priority): number =>
      PRIORITIES.indexOf(b) - PRIORITIES.indexOf(a),
  },
};
```

# 10. Final Output

Return:

* Utils created or extended (namespace path and members)
* Existing utils reused

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
