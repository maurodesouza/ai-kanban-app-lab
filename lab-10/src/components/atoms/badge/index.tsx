"use client";

import type * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "#/lib/cn";

// Badge — a small status indicator. One axis (variant: soft / solid /
// outline), none of which is colour. Tone arrives as a palette class applied
// from outside (`className="palette-danger"`); there is no
// `variant="destructive"` and no `tone` prop. This is the same discipline as
// Clickable.
//
// The badge is a COMPONENT, not a style family — the zero-variant rule does
// not apply. What does apply is that the variant axis is a fill strategy,
// not a colour.
//
// Text role follows the contract: `contrast` is content on a background YOU
// painted with base (solid); `accent` is content on soft or on a foreign
// background (soft, outline). Using contrast on soft made the light theme
// unreadable — white text on a near-white tint.

const badge = tv({
    base: `
        inline-flex items-center rounded-full border px-2.5 py-0.5
        text-xs font-medium transition-colors
        [&_svg:not([class*='size-'])]:size-3
    `,
    variants: {
        variant: {
            soft: "bg-palette-soft text-palette-accent border-transparent",
            solid: "bg-palette-base text-palette-contrast border-transparent",
            outline: "bg-transparent text-palette-accent border-palette-line",
        },
    },
    defaultVariants: {
        variant: "soft",
    },
});

type BadgeVariants = VariantProps<typeof badge>;

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & BadgeVariants;

function Badge({ className, variant, ...props }: BadgeProps) {
    return (
        <span
            data-slot="badge"
            className={cn(badge({ variant }), className as string)}
            {...props}
        />
    );
}

export { Badge, badge };
