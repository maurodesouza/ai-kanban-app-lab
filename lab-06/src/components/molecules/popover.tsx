import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef } from "react";
import { cn } from "#/utils/tailwind";

const Content = forwardRef<
    React.ComponentRef<typeof PopoverPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className,
        )}
        {...props}
    />
));
Content.displayName = "Popover.Content";

export const Popover = {
    Root: PopoverPrimitive.Root,
    Trigger: PopoverPrimitive.Trigger,
    Anchor: PopoverPrimitive.Anchor,
    Portal: PopoverPrimitive.Portal,
    Content,
    Close: PopoverPrimitive.Close,
};
