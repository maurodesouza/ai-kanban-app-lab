import * as React from "react";
import { cn } from "#/utils/cn";

export const Strong = React.forwardRef<
    HTMLElement,
    React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
    <strong
        ref={ref}
        className={cn("font-semibold text-foreground", className)}
        {...props}
    />
));
Strong.displayName = "Strong";
