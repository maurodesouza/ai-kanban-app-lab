import { tv } from "tailwind-variants";

const content = tv({
    base: `
        palette-raised bg-palette-base text-palette-contrast
        rounded-lg border border-palette-line shadow-md
        min-w-36 p-2
        max-h-(--available-height) origin-(--transform-origin)
        overflow-x-hidden overflow-y-auto
        data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95
        data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95
        data-[side=bottom]:slide-in-from-top-2
        data-[side=left]:slide-in-from-right-2
        data-[side=right]:slide-in-from-left-2
        data-[side=top]:slide-in-from-bottom-2
        data-[side=inline-start]:slide-in-from-right-2
        rtl:data-[side=inline-start]:slide-in-from-left-2
        data-[side=inline-end]:slide-in-from-left-2
        rtl:data-[side=inline-end]:slide-in-from-right-2
        duration-150 ease-out
    `,
});

// tooltip — a transient text label. Inverted palette (accent as background,
// base as text), no border, no shadow, compact padding, text-xs. Fade-only
// (a tooltip does not zoom or slide — it appears in place).
//
// `data-starting-style` / `data-ending-style` are TRANSITION markers (see
// layer.ts): the attribute lives one frame, so it drives a CSS transition,
// never a keyframe class. `data-instant` is set when the tooltip moves
// between triggers inside the provider's delay window — no fade then.
const tooltip = tv({
    base: `
        bg-palette-accent text-palette-base
        rounded-md
        max-w-72 px-2 py-1 text-xs
        transition-opacity duration-150 ease-out
        motion-reduce:transition-none data-instant:transition-none
        data-starting-style:opacity-0 data-ending-style:opacity-0
        z-50
    `,
});

export const popup = { content, tooltip };
