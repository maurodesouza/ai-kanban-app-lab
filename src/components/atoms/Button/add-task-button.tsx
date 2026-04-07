import React from "react";
import { tv, VariantProps } from "tailwind-variants";

import { twx } from "@/utils/tailwind";
import { Clickable } from "@/components/atoms/clickable";
import { Events } from "@/types/events";

const addTaskButtonVariants = tv({
  base: "flex items-center gap-2 min-h-[44px] min-w-[44px]",
  variants: {
    variant: {
      solid: "",
      ghost: "!bg-transparent !text-foreground hover:!bg-background-support",
    },
    size: {
      default: "",
      icon: "",
    },
  },
  defaultVariants: {
    variant: "solid",
    size: "default",
  },
});

type AddTaskButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof addTaskButtonVariants> & {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
};

const Root = twx.button`
  flex items-center gap-2
`;

const Icon = twx.span`
  flex-shrink-0
`;

const Text = twx.span`
  flex-shrink-0
`;

const LoadingSpinner = twx.span`
  animate-spin
`;

function AddTaskButtonComponent({
  onClick,
  disabled = false,
  loading = false,
  variant = "solid",
  size = "default",
  className,
  children = "Add Task",
  ...props
}: AddTaskButtonProps) {
  const handleClick = () => {
    if (!disabled && !loading) {
      // Emit modal open event
      const event = new CustomEvent(Events.MODAL_OPEN, { 
        detail: { modal: 'task' } 
      });
      document.dispatchEvent(event);
      onClick?.();
    }
  };

  return (
    <Clickable.Button
      onClick={handleClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      className={addTaskButtonVariants({ variant, size, className })}
      {...props}
    >
      <Icon>
        {loading ? (
          <LoadingSpinner>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </LoadingSpinner>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        )}
      </Icon>
      <Text>{children}</Text>
    </Clickable.Button>
  );
}

export const AddTaskButton = {
  Root,
  Icon,
  Text,
  LoadingSpinner,
  Component: AddTaskButtonComponent,
};
