import type { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { CheckIcon, ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/cn";
import { menu } from "../menu";
import { popup } from "../popup";

// Structural type of the namespace — only the parts the factory consumes.
// Root and Trigger are deliberately excluded: they differ between Menu and
// ContextMenu and stay in the specific component.
type MenuNamespace = {
    Item: typeof MenuPrimitive.Item;
    CheckboxItem: typeof MenuPrimitive.CheckboxItem;
    CheckboxItemIndicator: typeof MenuPrimitive.CheckboxItemIndicator;
    RadioGroup: typeof MenuPrimitive.RadioGroup;
    RadioItem: typeof MenuPrimitive.RadioItem;
    RadioItemIndicator: typeof MenuPrimitive.RadioItemIndicator;
    Group: typeof MenuPrimitive.Group;
    GroupLabel: typeof MenuPrimitive.GroupLabel;
    Separator: typeof MenuPrimitive.Separator;
    SubmenuRoot: typeof MenuPrimitive.SubmenuRoot;
    SubmenuTrigger: typeof MenuPrimitive.SubmenuTrigger;
    Portal: typeof MenuPrimitive.Portal;
    Positioner: typeof MenuPrimitive.Positioner;
    Popup: typeof MenuPrimitive.Popup;
};

export type MenuParts = ReturnType<typeof createMenuParts>;

export function createMenuParts(P: MenuNamespace) {
    function Item({
        className,
        inset,
        ...props
    }: MenuPrimitive.Item.Props & { inset?: boolean }) {
        return (
            <P.Item
                data-slot="menu-item"
                data-inset={inset}
                className={cn(menu.item(), className as string)}
                {...props}
            />
        );
    }

    function SelectableItem({
        className,
        inset,
        ...props
    }: MenuPrimitive.Item.Props & { inset?: boolean }) {
        return (
            <P.Item
                data-slot="menu-item"
                data-inset={inset}
                className={cn(menu.selectableItem(), className as string)}
                {...props}
            />
        );
    }

    function Label({
        className,
        inset,
        ...props
    }: MenuPrimitive.GroupLabel.Props & { inset?: boolean }) {
        return (
            <P.GroupLabel
                data-slot="menu-label"
                data-inset={inset}
                className={cn(menu.label(), className as string)}
                {...props}
            />
        );
    }

    function Separator({ className, ...props }: MenuPrimitive.Separator.Props) {
        return (
            <P.Separator
                data-slot="menu-separator"
                className={cn(menu.separator(), className as string)}
                {...props}
            />
        );
    }

    function Group({ ...props }: MenuPrimitive.Group.Props) {
        return <P.Group data-slot="menu-group" {...props} />;
    }

    function Shortcut({ className, ...props }: React.ComponentProps<"span">) {
        return (
            <span
                data-slot="menu-shortcut"
                className={cn(menu.shortcut(), className as string)}
                {...props}
            />
        );
    }

    function CheckboxItem({
        className,
        children,
        checked,
        inset,
        ...props
    }: MenuPrimitive.CheckboxItem.Props & { inset?: boolean }) {
        return (
            <P.CheckboxItem
                data-slot="menu-item"
                data-inset={inset}
                className={cn(menu.selectableItem(), className as string)}
                checked={checked}
                {...props}
            >
                <span
                    className={menu.itemIndicator()}
                    data-slot="menu-item-indicator"
                >
                    <P.CheckboxItemIndicator>
                        <CheckIcon />
                    </P.CheckboxItemIndicator>
                </span>
                {children}
            </P.CheckboxItem>
        );
    }

    function RadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
        return <P.RadioGroup data-slot="menu-radio-group" {...props} />;
    }

    function RadioItem({
        className,
        children,
        inset,
        ...props
    }: MenuPrimitive.RadioItem.Props & { inset?: boolean }) {
        return (
            <P.RadioItem
                data-slot="menu-item"
                data-inset={inset}
                className={cn(menu.selectableItem(), className as string)}
                {...props}
            >
                <span
                    className={menu.itemIndicator()}
                    data-slot="menu-item-indicator"
                >
                    <P.RadioItemIndicator>
                        <CheckIcon />
                    </P.RadioItemIndicator>
                </span>
                {children}
            </P.RadioItem>
        );
    }

    function SubTrigger({
        className,
        inset,
        children,
        ...props
    }: MenuPrimitive.SubmenuTrigger.Props & { inset?: boolean }) {
        return (
            <P.SubmenuTrigger
                data-slot="menu-sub-trigger"
                data-inset={inset}
                className={cn(menu.subTrigger(), className as string)}
                {...props}
            >
                {children}
                <ChevronRightIcon className="ms-auto rtl:rotate-180" />
            </P.SubmenuTrigger>
        );
    }

    function Content({
        className,
        align,
        alignOffset,
        side,
        sideOffset,
        ...props
    }: MenuPrimitive.Popup.Props &
        Pick<
            MenuPrimitive.Positioner.Props,
            "align" | "alignOffset" | "side" | "sideOffset"
        >) {
        return (
            <P.Portal>
                <P.Positioner
                    className="isolate z-50 outline-none"
                    align={align}
                    alignOffset={alignOffset}
                    side={side}
                    sideOffset={sideOffset}
                >
                    <P.Popup
                        data-slot="menu-content"
                        className={cn(
                            popup.content("z-50 outline-none"),
                            className as string,
                        )}
                        {...props}
                    />
                </P.Positioner>
            </P.Portal>
        );
    }

    function SubContent({
        className,
        side = "right",
        ...props
    }: React.ComponentProps<typeof Content>) {
        return (
            <Content
                data-slot="menu-sub-content"
                className={className}
                side={side}
                {...props}
            />
        );
    }

    return {
        // Sub is the primitive's SubmenuRoot, unstyled — it only groups. It
        // was initially missing: SubTrigger and SubContent existed, but
        // without the Root a submenu could not be mounted at all
        // (DropdownMenu.Sub / ContextMenu.Sub).
        Sub: P.SubmenuRoot,
        Item,
        SelectableItem,
        Label,
        Separator,
        Group,
        Shortcut,
        CheckboxItem,
        RadioGroup,
        RadioItem,
        SubTrigger,
        SubContent,
        Content,
    };
}
