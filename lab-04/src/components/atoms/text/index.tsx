import React from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { tv, type VariantProps } from 'tailwind-variants';

import { twx } from '@/utils/tailwind';
import { cn } from '@/utils/tailwind/index';

const headingVariants = tv({
  base: 'font-semibold text-foreground',
  variants: {
    hierarchy: {
      h1: 'text-xl',
      h2: 'text-lg',
      h3: 'text-md',
    },
  },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: Extract<keyof React.JSX.IntrinsicElements, 'h1' | 'h2' | 'h3'>;
  };

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  function Heading(props, ref) {
    const { as: Element = 'h1', className, ...rest } = props;

    return (
      <Element
        ref={ref}
        className={cn(
          headingVariants({
            hierarchy: Element,
          }),
          className
        )}
        {...rest}
      />
    );
  }
);

const Paragraph = twx.p`text-foreground text-sm transition-all`;

const TextLink = twx(
  RouterLink
)`text-tone-foreground-context text-sm hover:underline`;

const Clickable = twx.button`inline text-tone-foreground-context! text-sm hover:underline`;

const Strong = twx.strong`text-foreground text-sm font-semibold`;

const Small = twx.small`text-foreground text-xs italic`;

const Label = twx.label`text-foreground text-sm font-semibold block`;

const Highlight = twx.span`text-tone-foreground-context text-sm`;

const Error = cn(Highlight, 'tone palette-danger text-xs');

export const Text = {
  Heading,
  Paragraph,

  Link: TextLink,
  Small,
  Label,
  Error,
  Strong,
  Highlight,

  Clickable,
};
