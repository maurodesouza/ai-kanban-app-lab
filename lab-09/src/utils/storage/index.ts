export function readJSON<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);

        if (raw === null) return fallback;

        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function writeJSON(key: string, value: unknown): void {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage unavailable or full: the in-memory state stays the source of truth.
    }
}
