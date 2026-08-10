import { makeAutoObservable } from "mobx";

export type Theme = "light" | "dark";

export class ThemeStore {
    value: Theme;

    constructor(initialTheme: Theme = "light") {
        this.value = initialTheme;
        makeAutoObservable(this, {}, { autoBind: true });
    }

    toggle(): void {
        this.value = this.value === "light" ? "dark" : "light";
    }

    set(theme: Theme): void {
        this.value = theme;
    }

    reset(): void {
        this.value = "light";
    }
}
