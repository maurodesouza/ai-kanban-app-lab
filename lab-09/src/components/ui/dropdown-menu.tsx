"use client";

import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import type * as React from "react";
import { createMenuParts } from "@/components/families/menu/parts";
import { cn } from "@/lib/cn";

const parts = createMenuParts(MenuPrimitive);

function DropdownMenuRoot({ ...props }: MenuPrimitive.Root.Props) {
    return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
    return (
        <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
    );
}

function DropdownMenuContent({
    align = "start",
    alignOffset = 0,
    side = "bottom",
    sideOffset = 4,
    className,
    ...props
}: MenuPrimitive.Popup.Props &
    Pick<
        MenuPrimitive.Positioner.Props,
        "align" | "alignOffset" | "side" | "sideOffset"
    >) {
    return (
        <parts.Content
            data-slot="dropdown-menu-content"
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            className={cn(
                "max-h-(--available-height) origin-(--transform-origin) overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden",
                className as string,
            )}
            {...props}
        />
    );
}

function DropdownMenuSubContent({
    align = "start",
    alignOffset = -3,
    side = "right",
    sideOffset = 0,
    ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
    return (
        <DropdownMenuContent
            data-slot="dropdown-menu-sub-content"
            align={align}
            alignOffset={alignOffset}
            side={side}
            sideOffset={sideOffset}
            {...props}
        />
    );
}

export const DropdownMenu = {
    ...parts,
    Root: DropdownMenuRoot,
    Trigger: DropdownMenuTrigger,
    Content: DropdownMenuContent,
    SubContent: DropdownMenuSubContent,
};
