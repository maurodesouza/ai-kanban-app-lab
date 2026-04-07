import React, { JSX } from "react";
import { tv, VariantProps } from "tailwind-variants";

const inputVariants = tv({
  base: "flex w-full rounded-md border border-tone-contrast-300 bg-background-support px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-foreground-min focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-outer focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]",
  variants: {
    variant: {
      default: "",
      search: "pl-10",
    },
    size: {
      default: "h-10",
      sm: "h-9",
      lg: "h-11",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

type InputProps = React.ComponentProps<"input"> &
  VariantProps<typeof inputVariants>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  function Input(props, ref) {
    const { className, variant, size, ...rest } = props;

    return (
      <input
        ref={ref}
        className={inputVariants({ variant, size, className })}
        {...rest}
      />
    );
  }
);

const textareaVariants = tv({
  base: "flex min-h-[80px] w-full rounded-md border border-tone-contrast-300 bg-background-support px-3 py-2 text-sm ring-offset-background placeholder:text-foreground-min focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-outer focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
});

type TextareaProps = React.ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(props, ref) {
    const { className, ...rest } = props;

    return (
      <textarea
        ref={ref}
        className={textareaVariants({ className })}
        {...rest}
      />
    );
  }
);

export const Field = {
  Input,
  Textarea,
};
