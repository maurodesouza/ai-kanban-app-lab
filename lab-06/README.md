# AI Kanban App — Lab 06

A client-side Kanban board built as an architecture lab around explicit UI composition, command-driven writes, normalized state, accessible drag-and-drop, and composable task filters.

## Stack

- React 19 and TypeScript
- Vite and TanStack Router/Start
- MobX and `mobx-react-lite`
- Tailwind CSS with theme tokens
- Radix UI primitives
- dnd-kit
- Vitest and Testing Library
- Biome

## Scripts

```bash
pnpm dev          # Start the development server on port 3000
pnpm build        # Create a production build
pnpm preview      # Preview the production build
pnpm format       # Format the project with Biome
pnpm lint         # Run Biome checks
pnpm typecheck    # Run TypeScript without emitting files
pnpm test         # Run the Vitest suite
```

## Architecture decisions

### Command System

The Command System is the only application write path. Components read MobX stores and dispatch through the nested `actions` object; they do not import or call store mutators. Dedicated handlers connect commands to state changes and expose execution state through `useTransition` for disabled and pending UI.

### State and persistence

MobX stores use a normalized board model: columns contain ordered task IDs and tasks are held in an ID-keyed record. UI-only filters remain local to the current application session. localStorage persists only the board and theme, so search, date, priority, and dialog state reset after reload.

### Atomic design and explicit composition

Components follow atomic design: atoms provide controls and text, molecules wrap reusable interaction primitives, the Kanban organism exposes focused pieces, and the Board template assembles them. Composition is explicit at the call site, including every filter control, task cards, column actions, dialogs, and per-column empty states. `Kanban.Tasks` remains render-prop-only; the template separately composes `Kanban.Tasks.EmptyState`.

### Drag-and-drop and filters

Pointer and keyboard dnd-kit sensors support column reordering and task movement while preserving explicit action controls. Filters can be combined: title/description search dispatches after a 250 ms debounce, date range accepts either open bound or both bounds, and priority is an accessible five-value checkbox multi-select where no selection means all priorities. Filtering never removes columns, and columns without matches show an explicit empty state.

## Development and verification

Install existing dependencies and start development:

```bash
pnpm install
pnpm dev
```

Before handing off a change, run the complete verification sequence:

```bash
pnpm format
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```
