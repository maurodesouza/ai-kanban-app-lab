import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";
import { Form } from "@/components/molecules/form";
import { Text } from "@/components/atoms/text";

const filterInputVariants = tv({
  base: "relative",
  variants: {
    size: {
      sm: "w-48",
      default: "w-64",
      lg: "w-80",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

type FilterInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default" | "lg";
};

const Root = twx.div`
  relative
`;

const Input = twx.input`
  w-full h-10 pl-10 pr-4 rounded-md border border-tone-contrast-300 bg-background-support text-sm placeholder:text-foreground-min focus:outline-none focus:ring-2 focus:ring-ring-outer focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50
`;

const Icon = twx.div`
  absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground-min
`;

const ClearButton = twx.button`
  absolute right-2 top-1/2 transform -translate-y-1/2 text-foreground-min hover:text-foreground p-1 rounded-sm hover:bg-background-support
`;

function FilterInputComponent({
  value = "",
  onChange,
  placeholder = "Filter tasks...",
  disabled = false,
  className,
  size = "default",
  ...props
}: FilterInputProps) {
  const [localValue, setLocalValue] = React.useState(value);

  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setLocalValue("");
    onChange?.("");
  };

  return (
    <Root className={filterInputVariants({ size, className })} {...props}>
      <Icon>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </Icon>
      <Input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      {localValue && (
        <ClearButton onClick={handleClear} disabled={disabled}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </ClearButton>
      )}
    </Root>
  );
}

export const FilterInput = {
  Root,
  Input,
  Icon,
  ClearButton,
  Component: FilterInputComponent,
};
