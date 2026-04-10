import React from 'react';
import { tv, VariantProps } from 'tailwind-variants';

import { Text } from '@/components/atoms/text';

const fieldVariants = tv({
  base: 'flex flex-col gap-xs',
});

type FieldContainerProps = React.ComponentProps<'div'> &
  VariantProps<typeof fieldVariants>;

function Container(props: FieldContainerProps) {
  const { className, ...containerProps } = props;

  return <div className={fieldVariants({ className })} {...containerProps} />;
}

const textAreaVariants = tv({
  base: 'base-1 bg-background-base border border-ring-inner rounded-md px-xs py-xs text-foreground min-h-24 resize-y focus:outline-none focus:ring-2 focus:ring-tone-ring-inner',
  variants: {
    tone: {
      brand: 'tone palette-brand',
      success: 'tone palette-success',
      warning: 'tone palette-warning',
      danger: 'tone palette-danger',
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
});

type TextAreaProps = React.ComponentProps<'textarea'> &
  VariantProps<typeof textAreaVariants>;

function TextArea(props: TextAreaProps) {
  const { className, tone, ...textAreaProps } = props;

  return (
    <textarea
      className={textAreaVariants({
        className,
        tone,
      })}
      {...textAreaProps}
    />
  );
}

const inputVariants = tv({
  base: 'base-1 bg-background-base border border-ring-inner rounded-md px-xs py-xs text-foreground focus:outline-none focus:ring-2 focus:ring-tone-ring-inner',
  variants: {
    tone: {
      brand: 'tone palette-brand',
      success: 'tone palette-success',
      warning: 'tone palette-warning',
      danger: 'tone palette-danger',
    },
  },
  defaultVariants: {
    tone: 'brand',
  },
});

type InputProps = React.ComponentProps<'input'> &
  VariantProps<typeof inputVariants>;

function Input(props: InputProps) {
  const { className, tone, ...inputProps } = props;

  return (
    <input
      className={inputVariants({
        className,
        tone,
      })}
      {...inputProps}
    />
  );
}

export const Field = {
  Container,
  Label: Text.Label,
  Error: Text.Error,
  Input,
  TextArea,
};
