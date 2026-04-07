import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";

const cardVariants = tv({
  base: "rounded-lg border border-tone-contrast-300 bg-background-support text-foreground shadow-sm",
  variants: {
    variant: {
      default: "",
      elevated: "shadow-lg",
      outlined: "border-2",
      ghost: "border-transparent bg-transparent shadow-none",
    },
    padding: {
      none: "",
      sm: "p-4",
      default: "p-6",
      lg: "p-8",
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "default",
  },
});

type CardProps = React.ComponentProps<"div"> &
  VariantProps<typeof cardVariants>;

const Root = React.forwardRef<HTMLDivElement, CardProps>(
  function Card(props, ref) {
    const { className, variant, padding, ...rest } = props;
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...rest}
      />
    );
  }
);

const Header = twx.div`
  flex flex-col space-y-1.5 p-6
`;

const Title = twx.h3`
  text-2xl font-semibold leading-none tracking-tight
`;

const Description = twx.p`
  text-sm text-foreground-min
`;

const Content = twx.div`
  p-6 pt-0
`;

const Footer = twx.div`
  flex items-center p-6 pt-0
`;

export const Card = {
  Root,
  Header,
  Title,
  Description,
  Content,
  Footer,
};
