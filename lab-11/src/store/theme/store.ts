import { action, observable } from "mobx";
import type { ThemePreference } from "#/features/kanban/types";

class ThemeStore {
    @observable accessor preference: ThemePreference | null = null;

    @action
    setPreference(value: ThemePreference | null) {
        this.preference = value;
    }
}

export const themeStore = new ThemeStore();
