import { autorun, type IReactionDisposer } from "mobx";

export function persist<T extends object>(
    store: T,
    key: string,
    serialize: (store: T) => string,
): IReactionDisposer {
    if (typeof window === "undefined") return (() => {}) as IReactionDisposer;

    return autorun(() => {
        try {
            window.localStorage.setItem(key, serialize(store));
        } catch (error) {
            console.error(`[persist]: failed to save ${key}`, error);
        }
    });
}

export function hydrate<T>(key: string, fallback: () => T): T {
    if (typeof window === "undefined") return fallback();

    try {
        const raw = window.localStorage.getItem(key);
        if (!raw) return fallback();
        return JSON.parse(raw) as T;
    } catch (error) {
        console.error(`[hydrate]: failed to load ${key}`, error);
        return fallback();
    }
}
