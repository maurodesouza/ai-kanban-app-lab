export const date = {
    localDay(value: Date): string {
        const year = String(value.getFullYear()).padStart(4, "0");
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    },
    isDay(value: unknown): value is string {
        if (
            typeof value !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
            value.startsWith("0000")
        ) {
            return false;
        }
        const parsed = new Date(`${value}T00:00:00Z`);
        return (
            Number.isFinite(parsed.getTime()) &&
            parsed.toISOString().slice(0, 10) === value
        );
    },
    label(start: string, end: string): string {
        return start === end ? start : `${start} – ${end}`;
    },
};
