import { action, computed, observable } from "mobx";
import type { ThemePreference } from "#/features/kanban/types";

class ThemeStore {
    @observable accessor preference: ThemePreference | null = null;
    @observable accessor system: ThemePreference = "light";

    @action
    setPreference(value: ThemePreference | null) {
        this.preference = value;
    }

    @action
    setSystem(value: ThemePreference) {
        this.system = value;
    }

    @computed
    get $theme() {
        return this.preference ?? this.system;
    }

    @computed
    get $toggleUI() {
        return {
            label: this.$theme === "dark" ? "Light mode" : "Dark mode",
            icon: this.$theme === "dark" ? "☀" : "☾",
        };
    }
}

export const themeStore = new ThemeStore();
