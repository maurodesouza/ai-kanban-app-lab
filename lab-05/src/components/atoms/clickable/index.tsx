import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cn } from "#/utils/tailwind";

const buttonVariants = tv({
    base: "flex items-center gap-xs rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200",
    variants: {
        tone: {
            default:
                "bg-background-support text-foreground focus:ring-ring-inner",
            brand: "tone palette-brand",
            success: "tone palette-success",
            warning: "tone palette-warning",
            danger: "tone palette-danger",
        },
        variant: {
            solid: "bg-tone-luminosity-300 text-tone-foreground-contrast hover:brightness-125 data-[tone=default]:bg-background-support data-[tone=default]:text-foreground",
            ghost: "bg-transparent text-foreground hover:bg-tone-luminosity-300 hover:text-tone-foreground-contrast data-[tone=default]:hover:bg-background-support",
            outline:
                "bg-background-base text-tone-foreground-context border border-tone-ring-inner hover:bg-tone-luminosity-300 hover:text-tone-foreground-contrast",
            icon: "bg-transparent text-foreground hover:text-tone-foreground-context size-8 justify-center",
        },
        size: {
            default: "px-md py-xs",
            icon: "size-8 justify-center",
            full: "w-full justify-center px-md py-xs",
        },
        disabled: {
            true: "cursor-not-allowed opacity-50",
            false: "",
        },
    },
    defaultVariants: {
        tone: "default",
        variant: "solid",
        size: "default",
    },
});

type ButtonProps = React.ComponentProps<"button"> &
    VariantProps<typeof buttonVariants>;

function Button(props: ButtonProps) {
    const { tone, variant, size, disabled, className, ...rest } = props;

    return (
        <button
            className={cn(
                buttonVariants({ tone, variant, size, disabled }),
                className,
            )}
            data-tone={tone ?? "default"}
            disabled={disabled}
            type="button"
            {...rest}
        />
    );
}

export const Clickable = {
    Button,
};
