import { useEffect } from "react";
import { useTheme } from "#/hooks/use-theme";
import { command } from "#/lib/command";
import { THEME_STORAGE_KEY, type Theme } from "#/store/theme/store";
import { readJSON, writeJSON } from "#/utils/storage";

function isTheme(value: unknown): value is Theme {
    return value === "light" || value === "dark";
}

export function ThemeHandle() {
    const store = useTheme();

    function applyTheme(theme: Theme) {
        store.setTheme(theme);
        document.documentElement.dataset.theme = theme;
    }

    function hydrate() {
        const stored = readJSON<unknown>(THEME_STORAGE_KEY, null);

        if (isTheme(stored)) return applyTheme(stored);

        const prefersDark = window.matchMedia?.(
            "(prefers-color-scheme: dark)",
        ).matches;

        applyTheme(prefersDark ? "dark" : "light");
    }

    async function handleToggle() {
        const next = store.$nextTheme;

        applyTheme(next);
        writeJSON(THEME_STORAGE_KEY, next);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        hydrate();

        const disposes = [command.handle("theme.toggle", handleToggle)];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
