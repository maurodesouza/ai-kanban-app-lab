import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "#/components/ui/button";
import { applyTheme, getStoredTheme, storeTheme, type Theme } from "./theme";

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("light");

    useEffect(() => {
        const initial = getStoredTheme();
        setTheme(initial);
        applyTheme(initial);
    }, []);

    function toggle() {
        const next: Theme = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
        storeTheme(next);
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label="Toggle dark mode"
        >
            {theme === "dark" ? (
                <Sun className="size-5" />
            ) : (
                <Moon className="size-5" />
            )}
        </Button>
    );
}
