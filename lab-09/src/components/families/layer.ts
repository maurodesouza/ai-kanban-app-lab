import { tv } from "tailwind-variants";

// ─── TRANSITIONS, NOT KEYFRAMES ─────────────────────────────────────────────
// data-starting-style / data-ending-style are Base UI's TRANSITION markers:
// the element mounts with `data-starting-style`, the attribute is removed on
// the next frame, and a CSS `transition` interpolates from the starting
// values to the resting ones. `data-ending-style` is the mirror on close;
// Base UI keeps the element mounted until the transition ends.
//
// Pairing those markers with tw-animate-css keyframes (`animate-in`) was the
// bug behind every "abrupt" overlay: the keyframe class was gated on an
// attribute that lives for ONE frame, so the animation was cancelled as soon
// as it started. Keyframes are the right tool where the state persists
// (`data-open` in popup.content); for starting/ending markers it is always
// a transition. Duration and easing are declared here so every member of
// the family shares one tempo; the component adds its own motion (the
// dialog scales, the drawer slides) on top of the family's fade.

// backdrop — the scrim. fixed inset-0, the open/close fade, the stacking
// context. No layout: a nested overlay must not inherit a flex container.
const backdrop = tv({
    base: `
        fixed inset-0 z-50 bg-scrim
        transition-opacity duration-300 ease-out motion-reduce:transition-none
        data-starting-style:opacity-0 data-ending-style:opacity-0
    `,
});

// panel — the surface. raised palette, border, radius, shadow, focus outline
// reset. The dialog centring transform and the drawer edge transform are
// added by the component, not here. `outline-none` resets the popup's focus
// ring so the dialog's own focus management (initialFocus) is visible only on
// the focused child.
const panel = tv({
    base: `
        palette-raised bg-palette-base text-palette-contrast
        rounded-lg border border-palette-line shadow-lg
        outline-none
        transition-[opacity,scale,translate,transform] duration-300 ease-out
        motion-reduce:transition-none
        data-starting-style:opacity-0 data-ending-style:opacity-0
    `,
});

// header — title + description block. The dialog/drawer primitives do not
// provide a header element; this is the layout that groups the two.
const header = tv({
    base: "flex flex-col gap-1.5 p-6",
});

// body — the scrollable middle. `overflow-y-auto` and a max height keep long
// content from pushing the footer off-screen; the header and footer stay
// pinned by being outside the body.
const body = tv({
    base: "flex flex-col gap-4 px-6 py-2 overflow-y-auto",
});

// footer — the action row. End-aligned on the inline axis (justify-end), so
// the action pair flips correctly under RTL. Logical padding.
const footer = tv({
    base: "flex flex-row justify-end gap-3 p-6",
});

// title — palette + state only; typography comes from Text.Heading through
// render. The same discipline as field.label.
const title = tv({
    base: "text-palette-contrast",
});

// description — palette + state only; typography comes from Text.Paragraph
// through render.
const description = tv({
    base: "text-palette-accent/85",
});

export const layer = {
    backdrop,
    panel,
    header,
    body,
    footer,
    title,
    description,
};
