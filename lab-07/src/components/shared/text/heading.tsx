import * as React from "react";
import { cn } from "#/utils/cn";

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
}

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
    ({ className, level = 2, ...props }, ref) => {
        const Tag = `h${level}` as const;
        return (
            <Tag
                ref={ref}
                className={cn(
                    "font-semibold tracking-tight text-foreground",
                    level === 1 && "text-2xl",
                    level === 2 && "text-xl",
                    level === 3 && "text-lg",
                    level >= 4 && "text-base",
                    className,
                )}
                {...props}
            />
        );
    },
);
Heading.displayName = "Heading";
