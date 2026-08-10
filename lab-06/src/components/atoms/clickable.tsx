import { cva, type VariantProps } from "class-variance-authority";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "#/utils/tailwind";

export const clickableVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                primary:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
                ghost: "hover:bg-accent hover:text-accent-foreground",
                destructive:
                    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            },
            size: {
                sm: "h-8 px-3",
                md: "h-9 px-4 py-2",
                lg: "h-10 px-6",
                icon: "size-9 p-0",
            },
        },
        defaultVariants: { variant: "primary", size: "md" },
    },
);

type ClickableProps = ButtonHTMLAttributes<HTMLButtonElement> &
    VariantProps<typeof clickableVariants>;

const Button = forwardRef<HTMLButtonElement, ClickableProps>(
    ({ className, variant, size, type = "button", ...props }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(clickableVariants({ variant, size }), className)}
            {...props}
        />
    ),
);
Button.displayName = "Clickable.Button";

const Icon = forwardRef<HTMLButtonElement, Omit<ClickableProps, "size">>(
    ({ className, ...props }, ref) => (
        <Button ref={ref} size="icon" className={className} {...props} />
    ),
);
Icon.displayName = "Clickable.Icon";

export const Clickable = { Button, Icon };
