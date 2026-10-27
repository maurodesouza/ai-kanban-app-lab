"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { popup } from "@/components/families/popup";
import { cn } from "@/lib/cn";

// Tooltip — a transient text label that appears on hover or focus. Composes
// the `popup.tooltip` member (inverted palette, compact, fade-only). This is
// NOT `popup.content`: a tooltip is not a menu list or a popover — it has no
// border, no shadow, no raised surface, and no zoom animation. It is a text
// label, and the two are genuinely different things (named members, not
// variants — the zero-variant rule is preserved).
//
// The tooltip provider wraps a group of tooltips and coordinates their
// delay: when you move from one trigger to another, the first tooltip closes
// and the second opens without waiting for the delay again. This is
// behaviour from the primitive, not a style concern.
//
// `render` on Trigger is the project's single polymorphism mechanism —
// stitch it to a Clickable.Button, a Clickable.Link, or any element.

function TooltipProvider({ ...props }: TooltipPrimitive.Provider.Props) {
    return (
        <TooltipPrimitive.Provider data-slot="tooltip-provider" {...props} />
    );
}

function TooltipRoot({ ...props }: TooltipPrimitive.Root.Props) {
    return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
    return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

// Content takes the positioner's placement props, as Popover and the menus'
// Content do. The sidebar's icon rail is why: its tooltips go on the
// inline-end side, beside the icon, not above it over the next one.
function TooltipContent({
    className,
    align,
    alignOffset,
    side,
    sideOffset = 4,
    ...props
}: TooltipPrimitive.Popup.Props &
    Pick<
        TooltipPrimitive.Positioner.Props,
        "align" | "alignOffset" | "side" | "sideOffset"
    >) {
    return (
        <TooltipPrimitive.Portal>
            <TooltipPrimitive.Positioner
                className="z-50 outline-none"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <TooltipPrimitive.Popup
                    data-slot="tooltip-content"
                    className={cn(popup.tooltip(), className as string)}
                    {...props}
                />
            </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
    );
}

export const Tooltip = {
    Provider: TooltipProvider,
    Root: TooltipRoot,
    Trigger: TooltipTrigger,
    Content: TooltipContent,
};
