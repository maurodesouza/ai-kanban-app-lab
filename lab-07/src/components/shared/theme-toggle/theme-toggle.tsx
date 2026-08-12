import { Moon, Sun } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Button } from "#/components/shared/clickable/button";
import { actions } from "#/lib/command";
import { themeStore } from "#/stores";

export const ThemeToggle = observer(function ThemeToggle() {
    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => actions.theme.toggle()}
            aria-label="Toggle theme"
        >
            {themeStore.mode === "light" ? (
                <Moon className="h-5 w-5" />
            ) : (
                <Sun className="h-5 w-5" />
            )}
        </Button>
    );
});
