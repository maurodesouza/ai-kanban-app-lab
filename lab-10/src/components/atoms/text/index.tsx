import type { JSX } from "react";
import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "#/lib/cn";

const headingVariants = tv({
    base: "font-semibold text-palette-contrast",
    variants: {
        hierarchy: {
            // Tailwind's scale (there is no text-md in it). Canonical UI
            // progression: 24 / 20 / 18px. These used to be 40 / 28 / 20px —
            // landing-page sizes, too large for application UI.
            h1: "text-2xl",
            h2: "text-xl",
            h3: "text-lg",
        },
    },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof headingVariants> & {
        as?: Extract<keyof JSX.IntrinsicElements, "h1" | "h2" | "h3">;
    };

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    function Heading(props, ref) {
        const { as: Element = "h1", className, ...rest } = props;

        return (
            <Element
                ref={ref}
                className={headingVariants({
                    hierarchy: Element,
                    className,
                })}
                {...rest}
            />
        );
    },
);

// Secondary text — the settled value (architecture.md §6). The most-used token
// in the baseline (muted-foreground) maps to a role Fragiola deliberately
// lacks. The architecture proposed `text-palette-accent/70`, but OKLCH→WCAG
// measurement shows 70% fails AA (4.5:1) even on neutral surfaces
// (surface/light/base = 2.85:1). `accent/85` clears AA on every neutral
// surface (surface+raised, base+soft) in both themes — worst case 4.71:1.
// Secondary text realistically appears only on neutral backgrounds; chromatic
// palettes use `contrast` for their text, not a muted variant. The guard test
// checks the neutral surface palettes. Applied uniformly, including the
// placeholder.
const SECONDARY_TEXT = "text-palette-accent/85";

const Paragraph = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(function Paragraph({ className, ...rest }, ref) {
    return (
        <p
            ref={ref}
            className={cn(
                "text-palette-contrast text-sm transition-all",
                className,
            )}
            {...rest}
        />
    );
});

// A plain <a>. Consumers wire Next's or TanStack's Link through `render` —
// Fragiola ships one polymorphism mechanism and it is `render`, never asChild.
const Link = React.forwardRef<
    HTMLAnchorElement,
    React.AnchorHTMLAttributes<HTMLAnchorElement>
>(function Link({ className, ...rest }, ref) {
    return (
        <a
            ref={ref}
            className={cn(
                "text-palette-contrast text-sm hover:underline",
                className,
            )}
            {...rest}
        />
    );
});

const Clickable = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Clickable({ className, ...rest }, ref) {
    return (
        <button
            type="button"
            ref={ref}
            className={cn(
                "inline text-palette-contrast text-sm hover:underline",
                className,
            )}
            {...rest}
        />
    );
});

const Strong = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    function Strong({ className, ...rest }, ref) {
        return (
            <strong
                ref={ref}
                className={cn(
                    "text-palette-contrast text-sm font-semibold",
                    className,
                )}
                {...rest}
            />
        );
    },
);

const Small = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
    function Small({ className, ...rest }, ref) {
        return (
            <small
                ref={ref}
                className={cn(
                    "text-palette-contrast text-xs italic",
                    className,
                )}
                {...rest}
            />
        );
    },
);

const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(function Label({ className, ...rest }, ref) {
    return (
        // biome-ignore lint/a11y/noLabelWithoutControl: primitive — consumers associate it with a control via htmlFor
        <label
            ref={ref}
            className={cn(
                "text-palette-contrast text-sm font-semibold block",
                className,
            )}
            {...rest}
        />
    );
});

const Highlight = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(function Highlight({ className, ...rest }, ref) {
    return (
        <span
            ref={ref}
            className={cn("text-palette-contrast text-sm", className)}
            {...rest}
        />
    );
});

const TextError = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(function TextError({ className, ...rest }, ref) {
    return (
        <span
            ref={ref}
            className={cn("palette-danger text-xs", className)}
            {...rest}
        />
    );
});

export const Text = {
    Heading,
    Paragraph,
    Link,
    Small,
    Label,
    Error: TextError,
    Strong,
    Highlight,
    Clickable,
};

export { SECONDARY_TEXT };
