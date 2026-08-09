import { createContext, useContext } from "react";

import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { cn, twx } from "#/utils/tailwind";

type DialogContextValue = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const DialogContext = createContext<DialogContextValue | null>(null);

function useDialog() {
    const value = useContext(DialogContext);

    if (!value) {
        throw new Error("Dialog subcomponents must be used inside Dialog.Root");
    }

    return value;
}

type RootProps = {
    open: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
};

function Root({ open, onOpenChange, children }: RootProps) {
    return (
        <DialogContext.Provider
            value={{
                open,
                onOpenChange: onOpenChange ?? (() => {}),
            }}
        >
            {children}
        </DialogContext.Provider>
    );
}

type TriggerProps = {
    children: React.ReactNode;
};

function Trigger({ children }: TriggerProps) {
    const { onOpenChange } = useDialog();

    return (
        <Clickable.Button onClick={() => onOpenChange(true)}>
            {children}
        </Clickable.Button>
    );
}

type CloseProps = {
    children: React.ReactNode;
};

function Close({ children }: CloseProps) {
    const { onOpenChange } = useDialog();

    return (
        <Clickable.Button onClick={() => onOpenChange(false)}>
            {children}
        </Clickable.Button>
    );
}

type ContentProps = {
    children: React.ReactNode;
    className?: string;
};

const Overlay = twx.div`fixed inset-0 z-50 bg-background-base/80`;

const Panel = twx.div`base-1 fixed left-1/2 top-1/2 z-50 w-full max-w-150 -translate-x-1/2 -translate-y-1/2 border border-ring-inner bg-background-base rounded-md p-md shadow-lg`;

function Content({ children, className }: ContentProps) {
    const { open } = useDialog();

    if (!open) return null;

    return (
        <div className={cn("relative z-50", className)}>
            <Overlay />
            <Panel>{children}</Panel>
        </div>
    );
}

type TitleProps = {
    children: React.ReactNode;
    className?: string;
};

function Title({ children, className }: TitleProps) {
    return (
        <Text.Heading as="h3" className={className}>
            {children}
        </Text.Heading>
    );
}

type FooterProps = {
    children: React.ReactNode;
    className?: string;
};

function Footer({ children, className }: FooterProps) {
    return (
        <div
            className={cn(
                "flex justify-end gap-xs border-t border-ring-inner p-md",
                className,
            )}
        >
            {children}
        </div>
    );
}

export const Dialog = {
    Root,
    Trigger,
    Close,
    Content,
    Title,
    Footer,
};
