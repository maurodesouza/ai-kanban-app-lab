import { cva, type VariantProps } from "class-variance-authority";
import {
    forwardRef,
    type HTMLAttributes,
    type LabelHTMLAttributes,
} from "react";
import { cn } from "#/utils/tailwind";

const headingVariants = cva("font-semibold tracking-tight text-foreground", {
    variants: {
        level: {
            1: "text-3xl",
            2: "text-2xl",
            3: "text-xl",
            4: "text-lg",
        },
    },
    defaultVariants: { level: 2 },
});

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof headingVariants>;

const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, level = 2, ...props }, ref) => {
        const Component = `h${level ?? 2}` as "h1" | "h2" | "h3" | "h4";
        return (
            <Component
                ref={ref}
                className={cn(headingVariants({ level }), className)}
                {...props}
            />
        );
    },
);
Heading.displayName = "Text.Heading";

const Paragraph = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-foreground", className)}
        {...props}
    />
));
Paragraph.displayName = "Text.Paragraph";

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
Label.displayName = "Text.Label";

const ErrorText = forwardRef<
    HTMLParagraphElement,
    HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        role="alert"
        className={cn("text-sm text-destructive", className)}
        {...props}
    />
));
ErrorText.displayName = "Text.Error";

export const Text = { Heading, Paragraph, Label, Error: ErrorText };
