import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cn, twx } from "#/utils/tailwind";

const headingVariants = tv({
    base: "font-semibold text-foreground",
    variants: {
        hierarchy: {
            h1: "text-xl",
            h2: "text-lg",
            h3: "text-md",
        },
    },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof headingVariants> & {
        as?: "h1" | "h2" | "h3";
    };

function Heading(props: HeadingProps) {
    const { as: Element = "h1", className, ...rest } = props;

    return (
        <Element
            className={cn(
                headingVariants({ hierarchy: Element as "h1" | "h2" | "h3" }),
                className,
            )}
            {...rest}
        />
    );
}

const Paragraph = twx.p`text-foreground text-sm`;

const Label = twx.label`text-foreground text-sm font-semibold block`;

const ErrorMessage = twx.span`text-tone-foreground-context text-xs tone palette-danger`;

export const Text = {
    Heading,
    Paragraph,
    Label,
    Error: ErrorMessage,
};
