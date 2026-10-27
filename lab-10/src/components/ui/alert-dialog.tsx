"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import { createLayerParts } from "#/components/families/layer/parts";
import { cn } from "#/lib/cn";

// AlertDialog — the proof that `layer` is a family. This file declares ONLY
// what genuinely differs from dialog:
//   - the primitive namespace (AlertDialog, not Dialog)
//   - the absence of a close button (showClose={false}) — an alert dialog is
//     dismissed only by an explicit action, not by a corner X
//   - the action/cancel pair (which is just Clickable.Button composed in the
//     footer, not a new part)
//
// Everything else comes from `layer` through createLayerParts. AlertDialog
// reuses Dialog's Backdrop, Popup, Title, Description, Close and Portal at
// runtime (7/9 parts identical); the factory injects the namespace so each
// component inherits its own divergence if Base UI ever splits them.
//
// A destructive confirmation is `className="palette-danger"` on the action
// button — no `variant="destructive"`, no `tone` prop.
//
// Installing alert-dialog after dialog writes EXACTLY ONE FILE: this one.
// The `layer` family and the parts factory are already on disk.

const parts = createLayerParts(AlertDialogPrimitive);

function AlertDialogRoot({ ...props }: AlertDialogPrimitive.Root.Props) {
    return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />;
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
    return (
        <AlertDialogPrimitive.Trigger
            data-slot="alert-dialog-trigger"
            {...props}
        />
    );
}

function AlertDialogPortal({
    children,
    ...props
}: AlertDialogPrimitive.Portal.Props) {
    return (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props}>
            {children}
        </AlertDialogPrimitive.Portal>
    );
}

function AlertDialogBackdrop({
    className,
    ...props
}: React.ComponentProps<typeof parts.Backdrop>) {
    return <parts.Backdrop className={className} {...props} />;
}

function AlertDialogContent({
    className,
    ...props
}: React.ComponentProps<typeof parts.Content>) {
    return (
        // `z-50` lifts the wrapper above the backdrop's z-40: `position: fixed`
        // establishes a stacking context, so without this the panel's own z-50
        // is confined inside the wrapper and the backdrop paints over it.
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
            <parts.Content
                data-slot="alert-dialog-content"
                // No close button — an alert dialog is dismissed by an
                // explicit action, not a corner X. A boolean that toggles a
                // part is not a style variant.
                showClose={false}
                className={cn("w-full max-w-lg", className as string)}
                {...props}
            />
        </div>
    );
}

export const AlertDialog = {
    Root: AlertDialogRoot,
    Trigger: AlertDialogTrigger,
    Portal: AlertDialogPortal,
    Backdrop: AlertDialogBackdrop,
    Content: AlertDialogContent,
    Header: parts.Header,
    Body: parts.Body,
    Footer: parts.Footer,
    Title: parts.Title,
    Description: parts.Description,
    Close: parts.Close,
};
