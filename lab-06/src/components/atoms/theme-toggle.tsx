import { Moon, Sun } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { useTransition } from "#/hooks/use-transition";
import { actions } from "#/lib/command";
import { Clickable } from "./clickable";

const Button = forwardRef<
    HTMLButtonElement,
    ButtonHTMLAttributes<HTMLButtonElement>
>(
    (
        {
            disabled,
            children,
            onClick,
            "aria-label": ariaLabel = "Toggle theme",
            ...props
        },
        ref,
    ) => {
        const pending = useTransition(["theme.toggle"]);

        return (
            <Clickable.Icon
                ref={ref}
                aria-label={ariaLabel}
                aria-busy={pending}
                disabled={disabled || pending}
                onClick={(event) => {
                    onClick?.(event);
                    if (!event.defaultPrevented) void actions.theme.toggle();
                }}
                {...props}
            >
                {children ?? (
                    <>
                        <Sun
                            className="size-4 dark:hidden"
                            aria-hidden="true"
                        />
                        <Moon
                            className="hidden size-4 dark:block"
                            aria-hidden="true"
                        />
                    </>
                )}
            </Clickable.Icon>
        );
    },
);
Button.displayName = "ThemeToggle.Button";

export const ThemeToggle = { Button };
