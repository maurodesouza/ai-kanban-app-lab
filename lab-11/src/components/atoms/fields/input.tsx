import { Field as FieldPrimitive } from "@base-ui/react/field";
import { field } from "@/components/families/field";
import { cn } from "@/lib/cn";

// Bare control — text. No border, background, focus ring, invalid state or
// theme: all of that lives on the field.body that wraps this control. Uses
// FieldPrimitive.Control (Base UI) for the a11y wiring (id, aria-labelledby,
// aria-describedby, validation) when inside <Field.Root>; outside, it works
// as a plain input. The inputVariants.tone (5 values) is gone entirely —
// colour via the body's className.
export function Input({
    className,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Control>) {
    return (
        <FieldPrimitive.Control
            data-slot="input"
            className={cn(field.control(), className as string)}
            {...props}
        />
    );
}
