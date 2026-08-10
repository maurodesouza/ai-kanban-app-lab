import { forwardRef } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Dialog } from "./dialog";

type ActionProps = React.ComponentPropsWithoutRef<typeof Clickable.Button> & {
    asChild?: boolean;
};

const Confirm = forwardRef<HTMLButtonElement, ActionProps>(
    ({ variant = "destructive", ...props }, ref) => (
        <Dialog.Close asChild>
            <Clickable.Button ref={ref} variant={variant} {...props} />
        </Dialog.Close>
    ),
);
Confirm.displayName = "ConfirmDialog.Confirm";

const Cancel = forwardRef<HTMLButtonElement, ActionProps>(
    ({ variant = "outline", ...props }, ref) => (
        <Dialog.Close asChild>
            <Clickable.Button ref={ref} variant={variant} {...props} />
        </Dialog.Close>
    ),
);
Cancel.displayName = "ConfirmDialog.Cancel";

export const ConfirmDialog = {
    Root: Dialog.Root,
    Trigger: Dialog.Trigger,
    Portal: Dialog.Portal,
    Overlay: Dialog.Overlay,
    Content: Dialog.Content,
    Header: Dialog.Header,
    Title: Dialog.Title,
    Description: Dialog.Description,
    Body: Dialog.Body,
    Footer: Dialog.Footer,
    Close: Dialog.Close,
    Confirm,
    Cancel,
};
