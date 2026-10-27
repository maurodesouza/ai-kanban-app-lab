"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import type * as React from "react";
import { Text } from "@/components/atoms/text";
import { field } from "@/components/families/field";
import { cn } from "@/lib/cn";

// Field composition — stitches Base UI's Field primitive (behaviour/a11y)
// with the `field` family's style (appearance) via `render` (architecture.md
// §3). Namespace object: a single export, dot access.
//
// Base UI's Field resolves the a11y wiring that neither shadcn nor the
// reference code did: controlId↔labelId (aria-labelledby), aria-invalid,
// validate/validationMode, and aria-describedby on Description/Error via
// LabelableProvider. No div+useId reimplementation.

// Root — column: label, body, description, error. Passes validate,
// validationMode, invalid, disabled, name through to Base UI.
function FieldRoot({
    className,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Root>) {
    return (
        <FieldPrimitive.Root
            data-slot="field-root"
            className={cn(field.root(), className as string)}
            {...props}
        />
    );
}

// Label → Text.Label via render. Clicking the label activates the control
// (from Base UI, not reimplemented). field.label brings only palette/state;
// the typography (block/text-sm/font-semibold) comes from Text.Label.
function FieldLabel({
    className,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Label>) {
    return (
        <FieldPrimitive.Label
            data-slot="field-label"
            render={<Text.Label />}
            className={cn(field.label(), className as string)}
            {...props}
        />
    );
}

// ChoiceRoot — row layout for checkable controls (checkbox, radio, switch).
// Unlike Root: control on the left, label on the right (not on top). Uses
// field.choiceRoot instead of field.root. Reuses Label/Description/Error from
// the normal field. Base UI Field provides the same a11y wiring.
function FieldChoiceRoot({
    className,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Root>) {
    return (
        <FieldPrimitive.Root
            data-slot="field-choice-root"
            className={cn(field.choiceRoot(), className as string)}
            {...props}
        />
    );
}

// Row — THE BOX. Border, background, height, radius and focus ring. Wraps
// the body and addons; overflow-hidden clips the corners, so no child
// declares radius. Focusing the control highlights the entire field, addon
// included. (Correction: the border used to be on Body, which required an
// addon with its own border + border-l-0/rounded-l-none to join.)
function FieldRow({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-row"
            className={cn(field.row(), className as string)}
            {...props}
        />
    );
}

// Body — the control's area inside the box. No border and no background: the
// Row draws the box. Receives the bare control (Input/Textarea/Numeric) as a
// child and, optionally, Insets "inside".
function FieldBody({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-body"
            className={cn(field.body(), className as string)}
            {...props}
        />
    );
}

// Inset (INSIDE) — child of Body, inside the padding. Search icon, password
// eye button. A DISTINCT concept from Addon: no divider and no border, lives
// inside the control's area.
//
// There is deliberately NO Field.Control: the bare controls (Input/Textarea/
// Numeric) already ARE FieldPrimitive.Control and already apply
// field.control(). A wrapper repeating those classes would add a useless
// element and duplicate the style.
function FieldInset({ className, ...props }: React.ComponentProps<"div">) {
    return (
        <div
            data-slot="field-inset"
            className={cn(field.inset(), className as string)}
            {...props}
        />
    );
}

// Addon (OUTSIDE) — sibling of body, inside row. data-side indicates the
// side in logical vocabulary (architecture.md §6): inline-start/inline-end
// (inline axis, invert in RTL), block-start/block-end (block axis, do not
// invert). Default inline-end (right in LTR, left in RTL). Side is
// data-side, not a variant.
function FieldAddon({
    side = "inline-end",
    className,
    ...props
}: React.ComponentProps<"div"> & {
    side?: "inline-start" | "inline-end" | "block-start" | "block-end";
}) {
    return (
        <div
            data-slot="field-addon"
            data-side={side}
            className={cn(field.addon(), className as string)}
            {...props}
        />
    );
}

// Description → Text.Paragraph via render. field.description brings only
// palette/state; the typography comes from Text. Base UI registers the id in
// the LabelableProvider → aria-describedby on the control.
function FieldDescription({
    className,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Description>) {
    return (
        <FieldPrimitive.Description
            data-slot="field-description"
            render={<Text.Paragraph />}
            className={cn(field.description(), className as string)}
            {...props}
        />
    );
}

// Error → Text.Error via render. match controls visibility based on the
// field's ValidityState (e.g. match="valueMissing"). Base UI registers the id
// in the LabelableProvider → aria-describedby; data-invalid activates
// palette-danger.
function FieldError({
    className,
    match,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Error> &
    Pick<React.ComponentProps<typeof FieldPrimitive.Error>, "match">) {
    return (
        <FieldPrimitive.Error
            data-slot="field-error"
            render={<Text.Error />}
            match={match}
            className={cn(field.error(), className as string)}
            {...props}
        />
    );
}

export const Field = {
    Root: FieldRoot,
    ChoiceRoot: FieldChoiceRoot,
    Label: FieldLabel,
    Row: FieldRow,
    Body: FieldBody,
    Inset: FieldInset,
    Addon: FieldAddon,
    Description: FieldDescription,
    Error: FieldError,
};
