import * as React from "react";
import { Input } from "#/components/ui/input";
import { cn } from "#/utils/cn";

export interface DateInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    value?: string;
}

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    ({ className, value, onChange, ...props }, ref) => {
        return (
            <Input
                ref={ref}
                type="date"
                className={cn(className)}
                value={value ?? ""}
                onChange={onChange}
                {...props}
            />
        );
    },
);
DateInput.displayName = "DateInput";
