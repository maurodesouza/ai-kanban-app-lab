import type { Theme } from "#/store/theme/store";

const STORAGE_KEY = "kanban-lab-10:theme";

const THEMES: readonly Theme[] = ["light", "dark"];

export const theme = {
    storageKey: STORAGE_KEY,

    is: (value: unknown): value is Theme => THEMES.includes(value as Theme),

    // Runs before hydration, inlined in the document head, so it cannot import anything.
    bootstrapScript: `(function(){try{var t=JSON.parse(localStorage.getItem(${JSON.stringify(STORAGE_KEY)}));if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})();`,
};
