import * as DropdownPrimitive from "@radix-ui/react-dropdown-menu";
import { forwardRef } from "react";
import { cn } from "#/utils/tailwind";

const Content = forwardRef<
    React.ComponentRef<typeof DropdownPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
    <DropdownPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
            "z-50 min-w-32 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-md outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            className,
        )}
        {...props}
    />
));
Content.displayName = "DropdownMenu.Content";

const Item = forwardRef<
    React.ComponentRef<typeof DropdownPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>
>(({ className, ...props }, ref) => (
    <DropdownPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className,
        )}
        {...props}
    />
));
Item.displayName = "DropdownMenu.Item";

const Label = forwardRef<
    React.ComponentRef<typeof DropdownPrimitive.Label>,
    React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>
>(({ className, ...props }, ref) => (
    <DropdownPrimitive.Label
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", className)}
        {...props}
    />
));
Label.displayName = "DropdownMenu.Label";

const Separator = forwardRef<
    React.ComponentRef<typeof DropdownPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <DropdownPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-border", className)}
        {...props}
    />
));
Separator.displayName = "DropdownMenu.Separator";

export const DropdownMenu = {
    Root: DropdownPrimitive.Root,
    Trigger: DropdownPrimitive.Trigger,
    Portal: DropdownPrimitive.Portal,
    Content,
    Item,
    Label,
    Separator,
    Group: DropdownPrimitive.Group,
    RadioGroup: DropdownPrimitive.RadioGroup,
    RadioItem: DropdownPrimitive.RadioItem,
    ItemIndicator: DropdownPrimitive.ItemIndicator,
};
