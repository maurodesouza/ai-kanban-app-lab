"use client";

import { reaction } from "mobx";
import { useCallback, useEffect } from "react";
import { getRootStore } from "#/stores";

export function ThemeHandle() {
    const reflectTheme = useCallback((theme: "light" | "dark") => {
        document.documentElement.classList.toggle("dark", theme === "dark");
        document.documentElement.style.colorScheme = theme;
    }, []);

    useEffect(() => {
        const stores = getRootStore();
        return reaction(() => stores.theme.value, reflectTheme, {
            fireImmediately: true,
        });
    }, [reflectTheme]);

    return null;
}
