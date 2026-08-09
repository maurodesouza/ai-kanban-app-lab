import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { Text } from "#/components/atoms/text";

const containerVariants = tv({
    base: "flex flex-col gap-xs",
});

type ContainerProps = React.ComponentProps<"div"> &
    VariantProps<typeof containerVariants>;

function Container(props: ContainerProps) {
    const { className, ...rest } = props;

    return <div className={containerVariants({ className })} {...rest} />;
}

const inputVariants = tv({
    base: "base-1 bg-background-base border border-ring-inner rounded-md px-xs py-xs text-foreground focus:outline-none focus:ring-2 focus:ring-tone-ring-inner",
    variants: {
        tone: {
            brand: "tone palette-brand",
            success: "tone palette-success",
            warning: "tone palette-warning",
            danger: "tone palette-danger",
        },
    },
    defaultVariants: {
        tone: "brand",
    },
});

type InputProps = React.ComponentProps<"input"> &
    VariantProps<typeof inputVariants>;

function Input(props: InputProps) {
    const { className, tone, ...rest } = props;

    return <input className={inputVariants({ className, tone })} {...rest} />;
}

type TextAreaProps = React.ComponentProps<"textarea"> &
    VariantProps<typeof inputVariants>;

function TextArea(props: TextAreaProps) {
    const { className, tone, ...rest } = props;

    return (
        <textarea className={inputVariants({ className, tone })} {...rest} />
    );
}

export const Field = {
    Container,
    Label: Text.Label,
    Error: Text.Error,
    Input,
    TextArea,
};
