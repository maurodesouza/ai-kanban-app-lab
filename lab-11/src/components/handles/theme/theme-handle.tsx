import { reaction } from "mobx";
import { useEffect } from "react";
import type { ThemePreference } from "#/features/kanban/types";
import { actions, command } from "#/lib/command";
import { themeStore } from "#/store/theme/store";

export function ThemeHandle() {
    async function toggle() {
        themeStore.setPreference(
            themeStore.$theme === "dark" ? "light" : "dark",
        );
    }

    async function systemChanged({ value }: { value: ThemePreference }) {
        themeStore.setSystem(value);
    }

    function followSystem({ matches }: Pick<MediaQueryListEvent, "matches">) {
        void actions.theme.systemChanged({ value: matches ? "dark" : "light" });
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: the handlers only use the global theme store and command bus
    useEffect(() => {
        const dispose = [
            command.handle("theme.toggle", toggle),
            command.handle("theme.systemChanged", systemChanged),
        ];
        const system = window.matchMedia("(prefers-color-scheme: dark)");
        followSystem(system);
        system.addEventListener("change", followSystem);
        const stopApplying = reaction(
            () => themeStore.$theme,
            (mode) => {
                document.documentElement.dataset.theme = mode;
            },
            { fireImmediately: true },
        );
        return () => {
            system.removeEventListener("change", followSystem);
            stopApplying();
            for (const unregister of dispose) unregister();
        };
    }, []);

    return null;
}
