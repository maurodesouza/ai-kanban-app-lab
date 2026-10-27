"use client";

import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { useRender } from "@base-ui/react/use-render";
import * as React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "#/lib/cn";

// Clickable — the button surface. One component, three exports:
// `Button`, `Link`, `ExternalLink`. Composed by every clickable affordance in
// the project (a dialog's close, an alert-dialog's action pair, a badge's
// dismiss, a field addon's button).
//
// Clickable is a COMPONENT, not a style family — the zero-variant rule does
// not apply here. What does apply is that NONE of its axes may be colour.
// Tone arrives as a palette class applied from outside
// (`className="palette-danger"`); there is no `variant="destructive"` and no
// `tone` prop. This is what keeps `destructive` from coming back as 132 copies.
//
// Axes (orthogonal, none is colour):
//   variant  solid / ghost / outline / icon   fill strategy
//   size     sm / md                          measure — `md` is `h-control`,
//                                             so a button lines up with a field
//   shape    auto / square                    form — `square` zeroes inline
//                                             padding and squares the box
//
// `size` and `shape` are orthogonal and must stay so. Folding form into
// measure is what produces a `size="icon"` that cannot also be small — and a
// small square button is precisely what an addon needs. There is no
// `size="addon"`: an addon is a context that asks for a size, not a size
// itself.
//
// Icon sizing follows the button's size automatically, with an escape hatch:
// `[&_svg:not([class*='size-'])]:size-4`. The `:not()` is what lets an
// explicit override win without `!important`.
//
// `disabled` is a `tv` variant driven from the DOM prop, so a `<button>` and a
// `render`ed element behave the same. `**:pointer-events-none` matters: a
// disabled button containing an icon still swallows hover otherwise.
//
// `Link` is a plain `<a>` — framework-agnostic. Consumers stitch Next's or
// TanStack's link through `render`; that is the project's single polymorphism
// mechanism and the reason this component ships in a copy-paste registry.
// `ExternalLink` is a separate export (not a prop) because it differs in
// defaults and semantics (`target`, `rel`), not in appearance.

const clickable = tv({
    base: `
        inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md
        text-sm font-medium transition-colors
        focus-visible:outline-2 focus-visible:outline-palette-ring
        [&_svg:not([class*='size-'])]:size-4
    `,
    variants: {
        variant: {
            solid: "bg-palette-base text-palette-contrast hover:bg-palette-base-hover",
            ghost: "bg-transparent text-palette-accent hover:bg-palette-soft",
            outline:
                "border border-palette-line bg-transparent text-palette-accent hover:bg-palette-soft",
            // `icon` is a fill strategy, not a shape: transparent, no border,
            // a soft hover. Pair with `shape="square"` for an icon button.
            icon: "bg-transparent text-palette-accent hover:bg-palette-soft",
        },
        size: {
            xs: "h-4 px-2",
            sm: "h-8 px-3",
            md: "h-control px-4",
        },
        shape: {
            auto: "",
            // Zero inline padding and square the box against the height.
            square: "px-0 aspect-square",
        },
        disabled: {
            true: "pointer-events-none opacity-50 **:pointer-events-none",
        },
    },
    defaultVariants: {
        variant: "solid",
        size: "md",
        shape: "auto",
    },
});

type ClickableVariants = VariantProps<typeof clickable>;

type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
    ClickableVariants;

function Button({
    className,
    variant,
    size,
    shape,
    disabled,
    ...props
}: ButtonProps) {
    return (
        <ButtonPrimitive
            data-slot="clickable-button"
            className={cn(
                clickable({
                    variant,
                    size,
                    shape,
                    disabled: disabled || undefined,
                }),
                className as string,
            )}
            disabled={disabled}
            {...props}
        />
    );
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "color"> &
    ClickableVariants & {
        /** Stitch a router link (Next/TanStack) through `render`. */
        render?: React.ReactElement;
    };

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    { className, variant, size, shape, disabled, render, ...props },
    ref,
) {
    return useRender({
        render,
        ref,
        defaultTagName: "a",
        props: {
            ...props,
            className: cn(
                clickable({
                    variant,
                    size,
                    shape,
                    disabled: disabled || undefined,
                }),
                className as string,
            ),
        },
    });
});

type ExternalLinkProps = Omit<LinkProps, "target" | "rel"> & {
    /** Override the outbound `target` (default `_blank`). */
    target?: string;
    /** Override the outbound `rel` (default `noreferrer noopener`). */
    rel?: string;
};

const ExternalLink = React.forwardRef<HTMLAnchorElement, ExternalLinkProps>(
    function ExternalLink(
        {
            className,
            variant,
            size,
            shape,
            disabled,
            render,
            target = "_blank",
            rel = "noreferrer noopener",
            ...props
        },
        ref,
    ) {
        return useRender({
            render,
            ref,
            defaultTagName: "a",
            props: {
                ...props,
                target,
                rel,
                className: cn(
                    clickable({
                        variant,
                        size,
                        shape,
                        disabled: disabled || undefined,
                    }),
                    className as string,
                ),
            },
        });
    },
);

export const Clickable = {
    Button,
    Link,
    ExternalLink,
};

export { clickable };
