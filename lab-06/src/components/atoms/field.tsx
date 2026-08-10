import {
    forwardRef,
    type InputHTMLAttributes,
    type LabelHTMLAttributes,
    type ReactNode,
    type TextareaHTMLAttributes,
} from "react";
import { cn } from "#/utils/tailwind";

function Root({ children }: Readonly<{ children?: ReactNode }>) {
    return <>{children}</>;
}

const fieldClassName =
    "w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20";

const Input = forwardRef<
    HTMLInputElement,
    InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
    <input
        ref={ref}
        className={cn(fieldClassName, "h-9", className)}
        {...props}
    />
));
Input.displayName = "Field.Input";

const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(fieldClassName, "min-h-20 resize-y", className)}
        {...props}
    />
));
Textarea.displayName = "Field.Textarea";

const DateInput = forwardRef<
    HTMLInputElement,
    Omit<InputHTMLAttributes<HTMLInputElement>, "type">
>((props, ref) => <Input ref={ref} type="date" {...props} />);
DateInput.displayName = "Field.Date";

const Label = forwardRef<
    HTMLLabelElement,
    LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: The consumer explicitly composes the associated control and htmlFor.
    <label
        ref={ref}
        className={cn("text-sm font-medium text-foreground", className)}
        {...props}
    />
));
Label.displayName = "Field.Label";

const ErrorText = forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        role="alert"
        className={cn("text-sm text-destructive", className)}
        {...props}
    />
));
ErrorText.displayName = "Field.Error";

export const Field = {
    Root,
    Input,
    Textarea,
    Date: DateInput,
    Label,
    Error: ErrorText,
};
