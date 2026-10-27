import { reaction } from "mobx";
import { useEffect } from "react";
import { useTheme } from "#/hooks/use-theme";
import { command } from "#/lib/command";
import type { Theme } from "#/store/theme/store";
import { storage } from "#/utils/storage/storage";
import { theme } from "#/utils/theme/theme";

function getPreferredTheme(): Theme {
    const stored = storage.read(theme.storageKey);

    if (theme.is(stored)) return stored;

    const prefersDark = window.matchMedia?.(
        "(prefers-color-scheme: dark)",
    ).matches;

    return prefersDark ? "dark" : "light";
}

export function ThemeHandle() {
    const store = useTheme();

    async function handleSet(next: Theme) {
        store.setTheme(next);
        storage.write(theme.storageKey, next);
    }

    async function handleToggle() {
        await handleSet(store.$nextTheme);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        store.setTheme(getPreferredTheme());

        const disposeApply = reaction(
            () => store.theme,
            (current) => {
                document.documentElement.dataset.theme = current;
            },
            { fireImmediately: true },
        );

        const disposes = [
            command.handle("theme.toggle", handleToggle),
            command.handle("theme.set", handleSet),
        ];

        return () => {
            disposeApply();
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
