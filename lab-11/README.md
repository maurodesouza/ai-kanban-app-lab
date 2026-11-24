# Lab 11 · AI Todo App

A single-board Kanban app built with Vite, TanStack Start, MobX, and Fragiola UI. The browser stores the board, applied filters, and theme preference in localStorage for the current origin.

## Run locally

Use Node.js 22.18+, 24.11+, or 26+ according to the package engine range, with npm. From `lab-11/`:

```sh
npm ci
npm run dev
```

Vite prints the local URL. To check the production build locally:

```sh
npm run build
npm run preview
```

## Use the board

- Add a task from the header to choose a column, or use a column's Add task action. Start and end dates initially use your local calendar day.
- Change priority from the card. Drag its handle to another column with a mouse, or use the adjacent move buttons with keyboard or touch.
- Add a column with the trailing Add column tile. The controls on each column reorder, rename, or delete it. Deletion asks for confirmation and includes hidden tasks.
- Combine search, date overlap, and priority filters. The theme initially follows the system and remembers your explicit choice.

## Composition and commands

The [index route](src/routes/index.tsx) assembles the compound parts and supplies render callbacks for columns and tasks. The [root route](src/routes/__root.tsx) mounts the provider and shared modal host. Board parts read prepared MobX values and dispatch typed Command Bus actions. Handles validate, update state through plain setters, and perform storage and browser side effects.

## Validate

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

`npm run format` applies Biome fixes. In an environment with the Command Bus architecture skill, also run `node <command-bus-architecture>/scripts/check-architecture.mjs src`.
