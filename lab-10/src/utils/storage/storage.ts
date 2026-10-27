function readStorageValue(key: string): unknown {
    try {
        const raw = window.localStorage.getItem(key);

        if (raw === null) return null;

        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function writeStorageValue(key: string, value: unknown): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage may be full or unavailable (private mode); persistence is best effort.
    }
}

export const storage = {
    read: readStorageValue,
    write: writeStorageValue,
};
