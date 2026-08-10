import * as SelectPrimitive from "@radix-ui/react-select";
import { forwardRef } from "react";
import { cn } from "#/utils/tailwind";

const Trigger = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Trigger>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Trigger
        ref={ref}
        className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
            className,
        )}
        {...props}
    >
        {children}
    </SelectPrimitive.Trigger>
));
Trigger.displayName = "Select.Trigger";

const Icon = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Icon>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Icon>
>((props, ref) => <SelectPrimitive.Icon ref={ref} {...props} />);
Icon.displayName = "Select.Icon";

const Content = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, position = "popper", ...props }, ref) => (
    <SelectPrimitive.Content
        ref={ref}
        position={position}
        className={cn(
            "relative z-50 max-h-96 min-w-32 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            position === "popper" && "data-[side=bottom]:translate-y-1",
            className,
        )}
        {...props}
    />
));
Content.displayName = "Select.Content";

const Viewport = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Viewport>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Viewport>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Viewport
        ref={ref}
        className={cn("p-1", className)}
        {...props}
    />
));
Viewport.displayName = "Select.Viewport";

const Item = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className,
        )}
        {...props}
    />
));
Item.displayName = "Select.Item";

const ItemIndicator = forwardRef<
    React.ComponentRef<typeof SelectPrimitive.ItemIndicator>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.ItemIndicator>
>(({ className, ...props }, ref) => (
    <SelectPrimitive.ItemIndicator
        ref={ref}
        className={cn(
            "absolute left-2 inline-flex size-4 items-center justify-center",
            className,
        )}
        {...props}
    />
));
ItemIndicator.displayName = "Select.ItemIndicator";

export const Select = {
    Root: SelectPrimitive.Root,
    Trigger,
    Value: SelectPrimitive.Value,
    Icon,
    Portal: SelectPrimitive.Portal,
    Content,
    Viewport,
    Item,
    ItemText: SelectPrimitive.ItemText,
    ItemIndicator,
};
