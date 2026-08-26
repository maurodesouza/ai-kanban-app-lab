# AI Todo App — Kanban

A multi-board kanban application built with Vite + TanStack Start, mobX for state, shadcn/ui + Tailwind for styling, and a command-bus architecture for cross-component communication.

## Commands

- `pnpm dev` — start dev server (port 3000 or next available)
- `pnpm build` — production build
- `pnpm preview` — preview production build
- `pnpm format` — format code with Biome (4-space indent, final newline)
- `pnpm check` — run Biome linter + formatter checks
- `npx tsc --noEmit` — typecheck

## Architecture

- **Command system**: `src/lib/command/` — command bus, actions proxy, transitions store. Cross-component communication flows exclusively through commands. See `.devin/rules/command-architecture.md`.
- **State**: mobX store at `src/features/kanban/store/kanban-store.ts` — persists to `localStorage:kanban:store:v1` via a single `autorun`.
- **Handles**: `src/components/handles/modal/` (shared modal), `src/features/kanban/components/handles/kanban/` (scoped to boardId), `src/features/kanban/components/handles/board/` (global board ops).
- **Composition**: compound components with render props — `Kanban.Container/Header/Title/Content/Columns/Filter`, `KanbanColumn.Container/Header/Title/Content`, `KanbanTask.Container/Header/Title/Footer`.
- **Actions**: defined via module augmentation in `*-actions.ts` files, never edited in `global.ts` directly.

## Code Style

- Biome formatter: 4-space indent, double quotes, semicolons, trailing commas, final newline.
- `.editorconfig` matches Biome settings.
- Import aliases: `#/` and `@/` both map to `./src/`.
