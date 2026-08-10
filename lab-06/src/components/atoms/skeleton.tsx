import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "#/utils/tailwind";

const Root = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            aria-hidden="true"
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    ),
);
Root.displayName = "Skeleton.Root";

export const Skeleton = { Root };
