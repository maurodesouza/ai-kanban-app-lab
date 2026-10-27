"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { field } from "#/components/families/field";
import { menu } from "#/components/families/menu";
import { popup } from "#/components/families/popup";
import { cn } from "#/lib/cn";

// Select — the recombination test. This component is field + popup + menu,
// and it declares no new style. Every class comes from a family:
//   - Trigger uses field.row (the box) + layout
//   - Content uses popup.content (the floating box)
//   - Item uses menu.selectableItem (the option with indicator space)
//   - ItemIndicator uses menu.itemIndicator
//
// If this file contains a class that does not come from a family, the
// recombination claim is wrong. It does not.

function SelectRoot({ ...props }: SelectPrimitive.Root.Props<unknown>) {
    return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue({
    className,
    ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
    return (
        <SelectPrimitive.Value
            data-slot="select-value"
            className={cn(
                "text-sm text-palette-accent/85",
                className as string,
            )}
            {...props}
        />
    );
}

function SelectTrigger({
    className,
    children,
    ...props
}: SelectPrimitive.Trigger.Props) {
    return (
        <SelectPrimitive.Trigger
            data-slot="select-trigger"
            // The trigger IS a field row. The box (border, background, focus
            // ring) comes from field.row; the layout (flex-row, padding)
            // is the trigger's own. No new style classes.
            className={cn(
                field.row(),
                "flex-row items-center justify-between px-3 py-2",
                className as string,
            )}
            {...props}
        >
            {children}
            <ChevronDownIcon className="size-4 text-palette-accent/85" />
        </SelectPrimitive.Trigger>
    );
}

function SelectContent({
    className,
    align = "start",
    alignOffset = 0,
    side = "bottom",
    sideOffset = 4,
    ...props
}: SelectPrimitive.Popup.Props &
    Pick<
        SelectPrimitive.Positioner.Props,
        "align" | "alignOffset" | "side" | "sideOffset"
    >) {
    return (
        <SelectPrimitive.Portal>
            <SelectPrimitive.Positioner
                className="isolate z-50 outline-none"
                align={align}
                alignOffset={alignOffset}
                side={side}
                sideOffset={sideOffset}
            >
                <SelectPrimitive.Popup
                    data-slot="select-content"
                    className={cn(
                        popup.content("z-50 outline-none"),
                        className as string,
                    )}
                    {...props}
                />
            </SelectPrimitive.Positioner>
        </SelectPrimitive.Portal>
    );
}

function SelectItem({
    className,
    children,
    ...props
}: SelectPrimitive.Item.Props) {
    return (
        <SelectPrimitive.Item
            data-slot="select-item"
            className={cn(menu.selectableItem(), className as string)}
            {...props}
        >
            <SelectPrimitive.ItemIndicator
                className={menu.itemIndicator()}
                data-slot="select-item-indicator"
            >
                <CheckIcon />
            </SelectPrimitive.ItemIndicator>
            <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        </SelectPrimitive.Item>
    );
}

function SelectGroup({ ...props }: SelectPrimitive.Group.Props) {
    return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectLabel({
    className,
    ...props
}: SelectPrimitive.GroupLabel.Props) {
    return (
        <SelectPrimitive.GroupLabel
            data-slot="select-label"
            className={cn(menu.label(), className as string)}
            {...props}
        />
    );
}

function SelectSeparator({
    className,
    ...props
}: SelectPrimitive.Separator.Props) {
    return (
        <SelectPrimitive.Separator
            data-slot="select-separator"
            className={cn(menu.separator(), className as string)}
            {...props}
        />
    );
}

export const Select = {
    Root: SelectRoot,
    Trigger: SelectTrigger,
    Value: SelectValue,
    Content: SelectContent,
    Item: SelectItem,
    Group: SelectGroup,
    Label: SelectLabel,
    Separator: SelectSeparator,
};
