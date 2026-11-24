import { tv } from "tailwind-variants";

// focus — a standalone focusable (button, trigger, checkbox, tab, link): a
// 2px `ring` outline drawn 2px OUTSIDE the element. Outside, because `ring`
// contrasts with what is behind the element (architecture.md §1), and so it
// never covers the element's own border.
const focus = tv({
    base: `
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-palette-ring
    `,
});

// focusInset — an item inside a container that clips or packs its children
// (menu item, list row, grid cell, a tab inside its list): the same ring,
// drawn INSIDE the item, so a neighbour or the container's overflow never
// hides it.
const focusInset = tv({
    base: `
        focus-visible:outline-2 focus-visible:-outline-offset-2
        focus-visible:outline-palette-ring
    `,
});

// fieldFocus — a box whose control is inside it (the field row, a select
// trigger) or is itself (checkbox, radio, switch): the ring of `focus`,
// fired by the `.field-control` marker (global.css, `field-focus`), so a
// button inside the box (an addon, an inset) does not light the whole field.
const fieldFocus = tv({
    base: `
        field-focus:outline-2 field-focus:outline-offset-2
        field-focus:outline-palette-ring
    `,
});

// focusNested — a box whose focusable is a nested native input it does not
// render itself (the slider thumb's hidden range input).
const focusNested = tv({
    base: `
        has-[input:focus-visible]:outline-2
        has-[input:focus-visible]:outline-offset-2
        has-[input:focus-visible]:outline-palette-ring
    `,
});

// box — the control surface: a `line` stroke on a transparent background,
// with the value in `accent`. Every control box is this: the field row, the
// select and combobox triggers, an outline button, an unchecked checkbox.
//
// Transparent, not `soft`: a field sits on whatever floor it is on (a page,
// a raised card) and reads as part of it, and `soft` stays free to mean a
// STATE (hover, highlighted, selected). Transparent is also what lets the
// invalid state arrive by palette inheritance: under `palette-danger` the
// box becomes a red stroke with red text, never a red fill.
const box = tv({
    base: `
        border border-palette-line bg-transparent text-palette-accent
        transition-colors duration-150
    `,
});

// hover — a transparent interactive thing under the pointer: `soft`.
const hover = tv({
    base: "hover:bg-palette-soft",
});

// highlighted — the item the pointer or the keyboard is on inside a list
// (menu, select, combobox, command). Same `soft` as hover, with the text at
// full `contrast` so it reads as the active one.
const highlighted = tv({
    base: "highlighted:bg-palette-soft highlighted:text-palette-contrast",
});

// current — the one item of a set that is where you are: the active tab, the
// current page, the active sidebar or navigation link (`current`, global.css).
// `soft` with the text at `contrast` and a heavier weight.
const current = tv({
    base: `
        current:bg-palette-soft current:font-medium
        current:text-palette-contrast
    `,
});

// selected — items the user chose, any number of them: tree rows, grid and
// table rows, a dockable tabset's shown tab (`selected`, global.css). The
// same `soft` and `contrast` as `current`, without the weight: a selected
// row's text does not reflow.
const selected = tv({
    base: "selected:bg-palette-soft selected:text-palette-contrast",
});

// The mix reads `--palette-soft` and `--palette-base`, never the
// `--color-palette-*` theme variables: Tailwind declares those once on :root,
// where no palette is applied, so in an arbitrary value they resolve to
// nothing and the colour is dropped (silently: rule 8).
//
// hoverRow — a row under the pointer in a list whose selection is also
// `soft` (tree, grid, table): half of `soft` over the row's own `base`, so
// hover never reads as selected. Mixed opaque, not `soft/50`: a pinned
// grid cell must hide what scrolls under it.
const hoverRow = tv({
    base: `
        not-selected:hover:bg-[color-mix(in_oklab,var(--palette-soft)_50%,var(--palette-base))]
    `,
});

// panel — a container on a floor: a card, a tile, a grid, an accordion. The
// floor's `base` behind a `line` stroke, `rounded-lg`, no shadow.
const panel = tv({
    base: `
        rounded-lg border border-palette-line bg-palette-base
        text-palette-contrast
    `,
});

// overlay — a surface above the page: a popup, a menu, a popover, a dialog,
// a drawer. A raised panel with the overlay shadow (the elevation axis
// scales it). One edge, one shadow for everything that floats.
const overlay = tv({
    base: `
        palette-raised rounded-lg border border-palette-line bg-palette-base
        text-palette-contrast shadow-lg
    `,
});

// checked — the "on" mark of a two-state control and the filled part of a
// track: `ring`, the interaction role. On a neutral palette it is the dark
// neutral; on a `surface-*` palette it is that palette's colour; on a
// chromatic palette it is its deeper tone. The content on it (a check, a
// dot) is `base`. Checkbox, radio, switch, slider and progress all use it,
// so "on" means one colour across them.
const checked = tv({
    base: `
        data-checked:border-palette-ring data-checked:bg-palette-ring
        data-checked:text-palette-base
        data-indeterminate:border-palette-ring data-indeterminate:bg-palette-ring
        data-indeterminate:text-palette-base
    `,
});

// rail — the "off" ground of a track or a switch: `line`, the stroke role,
// so an empty track is visible on any floor (a `soft` track vanished on a
// white surface).
const rail = tv({
    base: "bg-palette-line",
});

// knob — what slides along a rail (a switch's thumb, a slider's thumb): the
// palette's `base` over a light shadow, so it reads as lifted above the rail.
const knob = tv({
    base: "bg-palette-base shadow-sm",
});

// disabled — dimmed and inert. Both the attribute Base UI emits and the
// native pseudo-class, so a `render`ed element and a native one agree.
const disabled = tv({
    base: `
        disabled:cursor-not-allowed disabled:opacity-50
        data-disabled:cursor-not-allowed data-disabled:opacity-50
    `,
});

// secondary — text that supports other text: descriptions, captions,
// placeholders. `accent` at 85%, the measured value that clears AA on every
// neutral surface (AGENTS.md, "Secondary text").
const secondary = tv({
    base: "text-palette-accent/85",
});

export const foundation = {
    focus,
    focusInset,
    fieldFocus,
    focusNested,
    box,
    hover,
    highlighted,
    current,
    selected,
    hoverRow,
    panel,
    overlay,
    checked,
    rail,
    knob,
    disabled,
    secondary,
};
