import { makeAutoObservable } from "mobx";

export type Theme = "light" | "dark";

export class ThemeStore {
    // #region Primitives
    theme: Theme = "light";
    // #endregion

    constructor() {
        makeAutoObservable(this, {}, { autoBind: true });
    }

    // #region Actions
    setTheme(theme: Theme) {
        this.theme = theme;
    }
    // #endregion

    // #region Derived primitives
    get $isDark() {
        return this.theme === "dark";
    }

    get $nextTheme(): Theme {
        return this.$isDark ? "light" : "dark";
    }
    // #endregion

    // #region UI
    get $themeToggleUI() {
        return {
            icon: this.$isDark ? ("sun" as const) : ("moon" as const),
            label: this.$isDark
                ? "Switch to light mode"
                : "Switch to dark mode",
        };
    }
    // #endregion
}

export const themeStore = new ThemeStore();
