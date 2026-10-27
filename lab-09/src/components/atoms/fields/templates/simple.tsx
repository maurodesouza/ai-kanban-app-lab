import type * as React from "react";
import { field } from "@/components/families/field";
import { Field } from "@/components/ui/field";
import { Input } from "../input";

// Input.Template.Simple — the tightest case. label, description, error,
// required, inset (inside, start/end), addon (outside, four sides) — all
// legitimate by rule 2 (content/behaviour). Survives with 7 props.
//
// The three rules:
// 1. No style of its own — no class, tv(), or hardcoded className beyond
//    field.inset() on the inset, which is a family piece (not template style).
// 2. No appearance props — no variant, size, color, contentClassName.
// 3. One className, going to the main piece (body) — the palette channel.
//
// Forbidden: contentProps / slotProps / any generic *Props bag. Props stay
// flat.
//
// Ceiling of 7 props: label, description, error, required, inset, addon,
// className. Input props (value, onChange, name, placeholder, type, etc.)
// are forwarded via ...props — they are behaviour, not template
// configuration. If an eighth is needed, stop and record it.
//
// inset: { start, end } — inside the body, before/after the control. Both
// sides can be filled at once (e.g. search icon + password toggle).
//
// addon: { inline: { start, end }, block: { start, end } } — outside the
// body, as siblings inside the row. Maps to the four data-side values of
// Field.Addon. Multiple sides can be filled at once; block addons use
// order-first/order-last so DOM order only matters for inline addons
// (inline-start before the body, inline-end after).

type SimpleProps = Omit<React.ComponentProps<typeof Input>, "className"> & {
    label?: React.ReactNode;
    description?: React.ReactNode;
    error?: React.ReactNode;
    required?: boolean;
    inset?: { start?: React.ReactNode; end?: React.ReactNode };
    addon?: {
        inline?: { start?: React.ReactNode; end?: React.ReactNode };
        block?: { start?: React.ReactNode; end?: React.ReactNode };
    };
    className?: string;
};

function Simple({
    label: labelContent,
    description,
    error,
    required,
    inset,
    addon,
    className,
    ...inputProps
}: SimpleProps) {
    return (
        <Field.Root>
            {labelContent ? (
                <Field.Label>
                    {labelContent}
                    {required ? <span aria-hidden="true">*</span> : null}
                </Field.Label>
            ) : null}
            <Field.Row>
                {addon?.block?.start ? (
                    <Field.Addon side="block-start">
                        {addon.block.start}
                    </Field.Addon>
                ) : null}
                {addon?.inline?.start ? (
                    <Field.Addon side="inline-start">
                        {addon.inline.start}
                    </Field.Addon>
                ) : null}

                <Field.Body className={className as string}>
                    {inset?.start ? (
                        <span className={field.inset()}>{inset.start}</span>
                    ) : null}
                    <Input {...inputProps} required={required} />
                    {inset?.end ? (
                        <span className={field.inset()}>{inset.end}</span>
                    ) : null}
                </Field.Body>

                {addon?.inline?.end ? (
                    <Field.Addon side="inline-end">
                        {addon.inline.end}
                    </Field.Addon>
                ) : null}
                {addon?.block?.end ? (
                    <Field.Addon side="block-end">
                        {addon.block.end}
                    </Field.Addon>
                ) : null}
            </Field.Row>
            {description ? (
                <Field.Description>{description}</Field.Description>
            ) : null}
            {error ? <Field.Error>{error}</Field.Error> : null}
        </Field.Root>
    );
}

export { Simple as TemplateSimple };
