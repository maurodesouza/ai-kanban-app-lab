import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";

const modalVariants = tv({
  base: "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-tone-contrast-300 bg-background-support p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
  variants: {
    size: {
      default: "max-w-lg",
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-full",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type ModalProps = React.ComponentProps<"div"> &
  VariantProps<typeof modalVariants> & {
    open?: boolean;
  };

const Content = React.forwardRef<HTMLDivElement, ModalProps>(
  function ModalContent(props, ref) {
    const { className, size, open, ...rest } = props;
    return (
      <div
        ref={ref}
        role="dialog"
        aria-modal={true}
        tabIndex={-1}
        className={modalVariants({ size, className })}
        data-state={open ? "open" : "closed"}
        {...rest}
      />
    );
  }
);

const Overlay = twx.div`
  fixed inset-0 z-50 bg-background-base/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
`;

const Header = twx.div`
  flex flex-col space-y-1.5 text-center sm:text-left
`;

const Title = twx.h2`
  text-lg font-semibold leading-none tracking-tight text-foreground
`;

const Description = twx.p`
  text-sm text-foreground-min
`;

const Body = twx.div`
  flex-1 text-sm text-foreground
`;

const Footer = twx.div`
  flex flex-col-reverse sm:flex-row gap-2 sm:justify-end
`;

const Close = twx.button`
  absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring-outer focus:ring-offset-2 disabled:pointer-events-none text-foreground h-8 w-8 p-0 min-h-[32px] min-w-[32px]
`;

export const Modal = {
  Content,
  Overlay,
  Header,
  Title,
  Description,
  Body,
  Footer,
  Close,
};
