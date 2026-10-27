const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const SHORT_FORMAT = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

function toLocalDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);

    return new Date(year, month - 1, day);
}

function toISODate(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDateRange(start: string, end: string): string {
    const startLabel = date.format.short(start);

    if (start === end) return startLabel;

    return `${startLabel} – ${date.format.short(end)}`;
}

export const date = {
    today: (): string => toISODate(new Date()),

    is: {
        isoDate: (value: unknown): value is string =>
            typeof value === "string" && ISO_DATE.test(value),
        before: (value: string, reference: string): boolean =>
            value < reference,
    },

    has: {
        overlap: (
            start: string,
            end: string,
            from: string,
            to: string,
        ): boolean => {
            if (from && end < from) return false;
            if (to && start > to) return false;

            return true;
        },
    },

    format: {
        short: (value: string): string =>
            SHORT_FORMAT.format(toLocalDate(value)),
        range: formatDateRange,
    },
};
