import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "#/utils/tailwind";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
    {
        variants: {
            priority: {
                none: "border-priority-none/30 bg-priority-none/15 text-priority-none",
                low: "border-priority-low/30 bg-priority-low/15 text-priority-low",
                medium: "border-priority-medium/30 bg-priority-medium/15 text-priority-medium",
                high: "border-priority-high/30 bg-priority-high/15 text-priority-high",
                urgent: "border-priority-urgent/30 bg-priority-urgent/15 text-priority-urgent",
            },
        },
        defaultVariants: { priority: "none" },
    },
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
    VariantProps<typeof badgeVariants>;

const Root = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, priority, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(badgeVariants({ priority }), className)}
            {...props}
        />
    ),
);
Root.displayName = "Badge.Root";

export const Badge = { Root };
