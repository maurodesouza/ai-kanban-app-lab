import { Field as FieldPrimitive } from "@base-ui/react/field";
import { field } from "@/components/families/field";
import { cn } from "@/lib/cn";

// Bare control — multiline text. Same rule as Input: no box of its own.
// Variable height: the textarea uses rows; the field.body that wraps it uses
// min-h-control (not fixed), so it grows with content without a size variant.
// render={<textarea />} swaps the default element (input) for textarea while
// keeping Base UI Field's a11y wiring.
export function Textarea({
    className,
    rows,
    ...props
}: React.ComponentProps<typeof FieldPrimitive.Control> & {
    rows?: number;
}) {
    return (
        <FieldPrimitive.Control
            data-slot="textarea"
            render={<textarea rows={rows} />}
            className={cn(
                field.control(),
                "min-h-control",
                className as string,
            )}
            {...props}
        />
    );
}
