import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";

const formVariants = tv({
  base: "space-y-4",
});

type FormProps = React.ComponentProps<"form"> &
  VariantProps<typeof formVariants>;

const Root = React.forwardRef<HTMLFormElement, FormProps>(
  function Form(props, ref) {
    const { className, ...rest } = props;
    return (
      <form
        ref={ref}
        className={formVariants({ className })}
        {...rest}
      />
    );
  }
);

const Field = twx.div`
  space-y-2
`;

const Label = twx.label`
  text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground
`;

const Error = twx.p`
  text-sm text-tone-luminosity-300 font-medium
`;

const Helper = twx.p`
  text-xs text-foreground-min
`;

const Actions = twx.div`
  flex justify-end gap-2 pt-4
`;

export const Form = {
  Root,
  Field,
  Label,
  Error,
  Helper,
  Actions,
};
