import { tv } from "tailwind-variants";

// The row every item of the family shares — popup or navigation. Not a
// member: it has no way of being lit, so on its own it is not an item.
const itemSkeleton = tv({
    base: `
        relative flex items-center gap-2 rounded-md text-sm select-none
        text-palette-accent/85
        data-disabled:pointer-events-none data-disabled:opacity-50
        data-inset:ps-7
        [&_svg:not([class*='size-'])]:size-4
        [&_svg]:pointer-events-none [&_svg]:shrink-0
    `,
});

// item is the central member of the popup lists. selectableItem and
// subTrigger derive from it via extend.
const item = tv({
    extend: itemSkeleton,
    base: `
        cursor-default py-1.5 px-1.5 outline-none
        highlighted:bg-palette-soft highlighted:text-palette-contrast
    `,
});

// selectableItem = item with space for the indicator (check) on the end side.
// Used by CheckboxItem, RadioItem, select item and combobox item.
// The pe-8 is not a style variation — it is a consequence of having an
// indicator, which is exactly why it is a member and not a variant.
const selectableItem = tv({
    extend: item,
    base: "pe-8 ps-1.5",
});

const label = tv({
    base: "text-palette-accent/85 px-1.5 py-1.5 text-xs font-medium data-inset:ps-7",
});

const separator = tv({
    base: "bg-palette-line -mx-1.5 my-1.5 h-px",
});

// Shortcut: secondary text (text-palette-accent/85 — the settled value).
// The original's focus colour change (group-focus/{name}:text-accent-foreground)
// has no equivalent without a secondary token; it distinguishes itself by
// size and position instead.
const shortcut = tv({
    base: "text-palette-accent/85 ms-auto text-xs tracking-widest",
});

// Sub-trigger = item + "popup open" state (data-popup-open).
const subTrigger = tv({
    extend: item,
    base: "data-popup-open:bg-palette-soft data-popup-open:text-palette-contrast",
});

const itemIndicator = tv({
    base: "pointer-events-none absolute inset-e-2 flex size-4 items-center justify-center",
});

// navItem — an item of a navigation list (Sidebar.MenuButton). Lit by hover,
// by `data-active` (the current page, which also takes the label weight) and
// by an open MENU it triggers (a team switcher is a navigation item that
// opens a menu). Base UI marks any trigger with `data-popup-open`, a
// tooltip's included — lit by that alone, an icon would look current while
// its tooltip shows — so it takes `aria-haspopup` as well, which menus set
// and tooltips do not. Full
// width, fixed height, the label truncates. `disabled` / `aria-disabled`
// because a button or a link is disabled natively, not through Base UI's
// `data-disabled`.
const navItem = tv({
    extend: itemSkeleton,
    base: `
        h-8 w-full overflow-hidden px-2 text-start
        hover:bg-palette-soft hover:text-palette-contrast
        data-active:bg-palette-soft data-active:font-medium data-active:text-palette-contrast
        [&[data-popup-open][aria-haspopup]]:bg-palette-soft
        [&[data-popup-open][aria-haspopup]]:text-palette-contrast
        focus-visible:outline-2 focus-visible:outline-palette-ring
        disabled:pointer-events-none disabled:opacity-50
        aria-disabled:pointer-events-none aria-disabled:opacity-50
        transition-[width,height,padding]
        [&>span:last-child]:truncate
    `,
});

// navSubItem — an item one level down (Sidebar.MenuSubButton). The same
// item, a step shorter.
const navSubItem = tv({
    extend: navItem,
    base: "h-7",
});

export const menu = {
    item,
    selectableItem,
    label,
    separator,
    shortcut,
    subTrigger,
    itemIndicator,
    navItem,
    navSubItem,
};
