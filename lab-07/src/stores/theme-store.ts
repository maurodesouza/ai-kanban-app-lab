import { makeAutoObservable } from "mobx";
import { hydrate, persist } from "#/utils/persist";

const STORAGE_KEY = "lab-07:theme:v1";

type ThemeMode = "light" | "dark";

interface ThemeSnapshot {
    mode: ThemeMode;
}

export class ThemeStore {
    mode: ThemeMode = "light";

    constructor() {
        const snapshot = hydrate<ThemeSnapshot | null>(STORAGE_KEY, () => null);
        if (snapshot?.mode === "light" || snapshot?.mode === "dark") {
            this.mode = snapshot.mode;
        }

        makeAutoObservable(this, {}, { autoBind: true });

        this.apply();
        persist(this, STORAGE_KEY, (store) =>
            JSON.stringify({ mode: store.mode }),
        );
    }

    toggle(): void {
        this.mode = this.mode === "light" ? "dark" : "light";
        this.apply();
    }

    set(mode: ThemeMode): void {
        this.mode = mode;
        this.apply();
    }

    apply(): void {
        if (typeof document === "undefined") return;

        document.documentElement.classList.toggle("dark", this.mode === "dark");
        document.documentElement.style.colorScheme = this.mode;
    }
}
