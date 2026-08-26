import type { ComponentProps, ReactNode } from "react";
import { cn } from "#/lib/utils";

export function Heading({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"h2">) {
    return (
        <h2
            className={cn("text-lg font-semibold tracking-tight", className)}
            {...props}
        >
            {children}
        </h2>
    );
}

export function Label({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"span">) {
    return (
        <span
            className={cn(
                "text-sm font-medium text-muted-foreground",
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export function Strong({
    children,
    className,
    ...props
}: { children: ReactNode; className?: string } & ComponentProps<"strong">) {
    return (
        <strong className={cn("font-semibold", className)} {...props}>
            {children}
        </strong>
    );
}

export const Text = { Heading, Label, Strong };
