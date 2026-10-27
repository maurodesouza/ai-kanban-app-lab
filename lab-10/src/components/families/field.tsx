import { tv } from "tailwind-variants";

// root — vertical column: label on top, box (row) in the middle,
// description/error below. `group/field` lets row/body/addon react to the
// data-disabled that Base UI emits on Root.
const root = tv({
    base: "group/field flex w-full flex-col gap-2",
});

// choiceRoot — horizontal row: control on the left, label on the right. For
// checkbox, radio and switch, which have no box. items-start aligns to the
// top — a label that wraps to two lines keeps its description aligned with
// the label, not with the control. Reuses label/description/error; does not
// use row/body/addon.
const choiceRoot = tv({
    base: "group/field flex w-full flex-row items-start gap-3",
});

// row — THE BOX. The only piece with border, background, radius and focus
// ring. overflow-hidden clips the corners of addons: no child needs to
// declare radius. flex-wrap + basis-full + order allow addons on all four
// sides — without an orientation prop, without an extra nesting level.
// min-h-control lives on the body (the control's area), not here: with a
// block addon on top, the row is already taller from the content.
const row = tv({
    base: `
        flex w-full min-w-0 flex-wrap items-stretch overflow-hidden
        rounded-md border border-palette-line bg-palette-soft
        text-sm text-palette-accent/85
        field-focus:outline-2 field-focus:outline-palette-ring
        group-data-disabled/field:cursor-not-allowed
        group-data-disabled/field:opacity-50
    `,
});

// body — the control's area inside the box. No border, no background and
// **no padding**: the row draws the box, and each piece (control, inset,
// addon) controls its own padding.
//
// Why padding does NOT live here: with padding on the body, the control is
// smaller than the box area. On a textarea the resize handle detaches from
// the corner and the field looks broken. With padding on the control, it
// fills the entire area and the handle sits flush against the border.
//
// ─── WHY `basis-px` AND NOT `flex-1` ─────────────────────────────────────────
// The row is flex-wrap, and line wrapping only happens when the sum of
// hypothetical main sizes EXCEEDS the container width (CSS Flexbox §9.3,
// step 5).
//
// `flex-1` is `flex: 1 1 0%` — flex-basis ZERO. With a block addon
// (basis 100%), the sum was 0 + 100% = 100%, which does not exceed: both
// stayed on the SAME line, free space was zero, and the body collapsed to
// 0px, squeezing the control into the corner while the addon took everything.
//
// `basis-px` (1px) is the minimum epsilon that makes the sum exceed —
// 1px + 100% > 100% — forcing the block addon to its own line. It is small
// enough not to interfere with inline addons, which still fit alongside.
const body = tv({
    base: "flex min-h-control min-w-0 grow shrink basis-px items-stretch",
});

// control — the bare middle. Transparent in every sense: no border, no
// background, no focus ring, no invalid state, no theme. All of that lives
// on the row. This property is what makes "creating a new control" be
// writing only the middle.
const control = tv({
    base: `
        field-control w-full min-w-0 bg-transparent px-3 py-2 text-sm text-palette-accent/85 outline-none
        placeholder:text-palette-accent/60
        selection:bg-palette-base selection:text-palette-contrast
        disabled:cursor-not-allowed
        file:border-0 file:bg-transparent file:text-sm file:font-semibold
    `,
});

// NOTE: block sides use `basis-full`, NOT `w-full`. In a flex-wrap container,
// line wrapping is decided by flex-basis — `width` does not participate.
// With `w-full`, the addon stayed on the same line as the body (which has
// flex-1, i.e. basis 0% and therefore compressible to zero), squeezing the
// control into the corner.
//
// addon (OUTSIDE) — sibling of body, inside row. Prefix/suffix ("Kg",
// "https://") or an attached button. Has no border or radius of its own:
// only a divider on the seam side, and the row's overflow-hidden clips the
// corners.
//
// Four sides in logical vocabulary (architecture.md §6):
//   inline-start / inline-end — inline axis, border-s/border-e (invert in RTL)
//   block-start / block-end   — block axis, border-b/border-t (do not invert)
//                                + basis-full + order-first/order-last
//
// Side is data-side, NOT a variant — zero variants means zero.
const addon = tv({
    base: `
        flex shrink-0 items-center self-stretch px-3 text-sm text-palette-accent/85
        border-palette-line
        data-[side=inline-start]:border-e
        data-[side=inline-end]:border-s
        data-[side=block-start]:basis-full data-[side=block-start]:order-first data-[side=block-start]:border-b
        data-[side=block-end]:basis-full data-[side=block-end]:order-last data-[side=block-end]:border-t
        [&>kbd]:rounded-[calc(var(--radius-md)-2px)] [&>button]:rounded-[calc(var(--radius-md)-2px)]
        [&_svg:not([class*='size-'])]:size-4
    `,
});

// inset (INSIDE) — direct child of body, inside the padding. Search icon,
// password eye button. A DISTINCT concept from addon: no divider and no
// border, it lives inside the control's area.
//
// Padding only on the OUTER side (first:ps / last:pe): the spacing between
// the inset and the control comes from the control's own padding, so it does
// not double up. For more than one icon on the same side, use one inset with
// multiple children — the gap-2 separates them.
const inset = tv({
    base: `
        flex shrink-0 items-center justify-center gap-2 text-palette-accent/85
        first:ps-3 last:pe-3
        [&>kbd]:rounded-[calc(var(--radius-md)-2px)] [&>button]:rounded-[calc(var(--radius-md)-2px)]
        [&_svg:not([class*='size-'])]:size-4
    `,
});

// label / description / error — point at Text (the composition stitches via
// render). The family declares only palette and state, NOT typography:
// Text.Label brings block/text-sm/font-semibold, Text brings text-sm,
// Text.Error brings palette-danger/text-xs. Redefining typography here would
// violate the composition rule — the same rule as DialogTitle. data-disabled
// comes from Base UI itself on these elements.
const label = tv({
    base: "text-palette-accent/85 leading-none data-disabled:opacity-50",
});

const description = tv({
    base: "text-palette-accent/85 data-disabled:opacity-50",
});

const error = tv({
    base: "data-disabled:opacity-50",
});

export const field = {
    root,
    choiceRoot,
    row,
    body,
    control,
    addon,
    inset,
    label,
    description,
    error,
};
