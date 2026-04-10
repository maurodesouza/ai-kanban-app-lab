import React from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';
import { tv, VariantProps } from 'tailwind-variants';

import { twx } from '@/utils/tailwind';

const buttonVariants = tv({
  base: 'flex items-center gap-xs rounded-md hover:no-underline! focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200',
  variants: {
    tone: {
      default: 'bg-background-support text-foreground focus:ring-ring-inner',
      brand: 'tone palette-brand focus:ring-tone-300',
      success: 'tone palette-success focus:ring-tone-300',
      warning: 'tone palette-warning focus:ring-tone-300',
      danger: 'tone palette-danger focus:ring-tone-300',
    },
    variant: {
      solid: `
          bg-tone-luminosity-300! text-tone-foreground-contrast! hover:brightness-125 focus-visible:brightness-110
          data-[tone=default]:bg-background-support! data-[tone=default]:text-foreground!
      `,
      ghost: `
        bg-transparent! text-foreground! hover:bg-tone-luminosity-300! hover:text-tone-foreground-contrast! focus-visible:bg-tone-luminosity-200! focus-visible:text-tone-foreground-contrast!
        data-[tone=default]:hover:bg-background-support! data-[tone=default]:hover:text-foreground! data-[tone=default]:focus-visible:bg-background-support!
      `,
      outline: `
        bg-background! text-tone-foreground-context!
        box-border border-tone-ring-inner!
        hover:bg-tone-luminosity-300! hover:text-tone-foreground-contrast! focus-visible:bg-tone-luminosity-200! focus-visible:text-tone-foreground-contrast!
        data-[tone=default]:text-foreground! data-[tone=default]:border-ring-inner!
        data-[tone=default]:hover:bg-background-support! data-[tone=default]:hover:text-foreground! data-[tone=default]:hover:border-background-support!
        data-[tone=default]:focus-visible:bg-background-support! data-[tone=default]:focus-visible:text-foreground!
      `,
      icon: `
        bg-transparent! text-foreground! hover:text-tone-foreground-context! focus-visible:text-tone-foreground-context!
        data-[tone=default]:hover:text-foreground-max! data-[tone=default]:focus-visible:text-foreground-max!
      `,
    },
    size: {
      icon: 'size-8 justify-center',
      full: 'px-md py-xs w-full justify-center',
      default: 'px-md py-xs',
    },

    disabled: {
      true: 'cursor-not-allowed! opacity-50 **:cursor-not-allowed! focus:ring-0!',
      false: '',
    },
  },

  defaultVariants: {
    size: 'default',
    tone: 'default',
    variant: 'solid',
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants> & {
  asChild?: boolean;
};

type ButtonProps = React.ComponentProps<'button'> & ButtonVariantProps;

export const Button = twx.button.attrs<ButtonProps>(props => ({
  'data-tone': props.tone ?? 'default',
}))(props => buttonVariants(props));

type LinkProps = ButtonVariantProps &
  NextLinkProps & {
    className?: string;
  };

function Link(props: React.PropsWithChildren<LinkProps>) {
  const { tone = 'default', variant, size, className, ...linkProps } = props;

  return (
    <Button
      tone={tone}
      variant={variant}
      size={size}
      className={className}
      asChild
    >
      <NextLink {...linkProps} />
    </Button>
  );
}

type ExternalLinkProps = ButtonProps & React.ComponentProps<'a'>;

function ExternalLink(props: ExternalLinkProps) {
  const { tone = 'default', variant, size, className, ...anchorProps } = props;

  return (
    <Button
      tone={tone}
      variant={variant}
      size={size}
      className={className}
      asChild
    >
      <a {...anchorProps} />
    </Button>
  );
}

export const Clickable = {
  Button,
  Link,
  ExternalLink,
};
