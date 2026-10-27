---
name: fragiola-ui
description: Build every user interface with Fragiola UI (shadcn-style registry on Base UI + Tailwind v4), following its examples and rules. Use before creating or changing any UI component.
---

# User Input

```text
$ARGUMENTS
```

# Objective

Every interface is built with Fragiola UI and follows its patterns.

Do not hand-roll a component that Fragiola provides. Do not mix in another component library.

# 1. Reference

* Source: `~/organizations/fragiola/ui` (GitHub `fragiola/ui`).
* Docs: https://fragiola.com/ui
* Before using any component, read in the reference:
  * `AGENTS.md` - the non-negotiable rules.
  * `docs/architecture.md` - palettes, style families, composition.
  * `examples/react/src/examples/<component>.tsx` - the canonical usage. Imitate it.
  * `site/docs/<category>/<component>.mdx` - the component documentation.
  * `packages/registry/registry/ui/<component>.tsx` - the component parts, when the example is not enough.

If the local reference does not exist, use the docs site.

# 2. Installation

Fragiola has no npm package. Components are copied into the project with the shadcn CLI.

1. Make sure `components.json` has the registry:

```json
{
  "registries": {
    "@fragiola": {
      "url": "https://fragiola.com/r/{name}.json"
    }
  }
}
```

2. Install each component the UI needs:

```bash
npx shadcn@latest add @fragiola/<component>
```

3. Import `styles/global.css` and every installed palette once in the CSS entry, after Tailwind.

Verify the shadcn CLI usage with `epic-current-documentation`.

Installed files are owned by the project, but prefer composition over editing them.

## Fallback: shadcn + conversion

Use the fallback when the Fragiola registry is unreachable or Fragiola has no equivalent component.

Do not copy files manually from the reference and do not point `components.json` to a local server.

1. Install the component from the default shadcn registry (`npx shadcn@latest add <component>`), preferring its Base UI flavor when available (verify with `epic-current-documentation`).
2. Never let the shadcn CLI overwrite a file already installed from Fragiola. If it asks, answer no.
3. Convert the installed component to Fragiola (section 3), using these mappings (from `docs/port-report*.md` in the reference):

| shadcn | Fragiola |
| --- | --- |
| `bg-background text-foreground` | `palette-surface bg-palette-base text-palette-contrast` |
| `bg-popover text-popover-foreground`, `bg-card text-card-foreground` | `palette-raised bg-palette-base text-palette-contrast` |
| `text-muted-foreground` | `text-palette-accent/85` |
| `bg-muted`, `bg-accent`, hover backgrounds | `bg-palette-soft` |
| `text-accent-foreground` | `text-palette-accent` |
| `border`, `border-input`, `bg-border`, `ring-foreground/10 ring-1` | `border-palette-line` / `bg-palette-line` / `border border-palette-line` |
| `bg-primary text-primary-foreground` | `bg-palette-base text-palette-contrast` inside the chosen palette (e.g. `palette-blue`) |
| `data-[state=checked]:bg-primary` | `data-checked:bg-palette-base` |
| `destructive` variant / classes | `palette-danger` class, no variant |
| `focus-visible:ring-*` | `field-focus:outline-2 field-focus:outline-palette-ring` |
| `dark:*` blocks | removed; palettes handle both themes |
| `asChild` | `render` |
| `pl`/`pr`, `ml`/`mr`, `left`/`right`, `border-l`/`border-r` | `ps`/`pe`, `ms`/`me`, `start`/`end`, `border-s`/`border-e` |
| input with its own border / background / height | body moved to the `Field` frame |
| `!important` | removed; report the architectural problem |

4. Reuse existing Fragiola families and atoms (`Clickable`, `Field`, `Text`, popup / menu families) instead of keeping shadcn's duplicated styles.
5. When nothing in the table fits, pick the role by meaning (section 3) or use another existing palette. Never add a new token or role.
6. After converting, no shadcn token may remain: search the file for `primary`, `secondary`, `muted`, `accent-foreground`, `popover`, `card`, `destructive`, `foreground`, `background`, `input`, `ring-offset`, `dark:` and `asChild`.
7. Report the converted component in the final output as `converted from shadcn`.

# 3. Fragiola Rules

Follow the rules from `AGENTS.md`:

* Color comes from palettes (`palette-surface`, `palette-raised`, ...) and their 6 roles (`base`, `soft`, `line`, `contrast`, `accent`, `ring`), e.g. `bg-palette-base`, `border-palette-line`, `text-palette-contrast`. No ad-hoc colors.
* Secondary text uses `text-palette-accent/85`.
* Use `render`, never `asChild`.
* Compose parts (`Dialog.Root`, `Dialog.Content`, `Field.Root`, `Field.Label`, ...) exactly as the examples do.
* Controls carry no body: border, background, height and focus ring live on the field frame (`Field`), not on the input.
* Logical properties on the inline axis (`ps`/`pe`, `ms`/`me`, `border-s`/`border-e`, `start`/`end`).
* No `!important`.
* Use Tailwind scales; no arbitrary values when a scale value exists.

# 4. Fragiola + Command Bus

Fragiola components are presentation. They follow `command-bus-architecture`:

* Overlays (`Dialog`, `AlertDialog`, `Drawer`, `Popover`, ...) are **controlled**: `open` comes from a store `$<part>UI`, and `onOpenChange` dispatches an action (e.g. `actions.board.cardDialog.change({ open })`). The Handle decides and updates the store.
* Values, labels, texts, variants and disabled states come from `$<part>UI`.
* Clicks and submits dispatch actions through `actions`.
* No logic inside the component.

# 5. Verify by Compiling

A Tailwind class that does not exist fails silently. After building the UI:

* Run typecheck, lint and build.
* Check that every class used exists in Fragiola's theme / palettes or in Tailwind.

# 6. Final Output

Return:

* Fragiola components installed
* Components converted from shadcn (fallback), with the reason
* Components created or changed
* Palettes used
* Verification performed

Return this output to the calling skill and continue its flow. Do not end the run here unless this skill was invoked directly by the user.
