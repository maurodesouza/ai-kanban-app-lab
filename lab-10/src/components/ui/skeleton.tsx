import type * as React from "react";
import { cn } from "#/lib/cn";

// Skeleton — a placeholder for loading content. No primitive, no family.
// `bg-palette-soft` (a role) + `animate-pulse` (Tailwind's built-in). The
// shape is controlled by the consumer via className (default `h-4 w-full`).
//
// `animate-pulse` respects `prefers-reduced-motion` automatically — Tailwind
// disables it under `motion-reduce`. No custom keyframe needed.

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="skeleton"
            className={cn(
                "animate-pulse rounded-md bg-palette-soft",
                className as string,
            )}
            {...props}
        />
    );
}

export { Skeleton };
