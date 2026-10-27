const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function pad(value: number) {
    return String(value).padStart(2, "0");
}

/** Today's local date as `YYYY-MM-DD`. */
export function today(now = new Date()) {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isDateString(value: unknown): value is string {
    return typeof value === "string" && DATE_PATTERN.test(value);
}

/** `YYYY-MM-DD` strings sort chronologically, so they compare as text. */
export function isBefore(date: string, other: string) {
    return date < other;
}

const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
});

export function formatDate(date: string) {
    const [year, month, day] = date.split("-").map(Number);

    return formatter.format(new Date(year, month - 1, day));
}

export function formatDateRange(startDate: string, endDate: string) {
    if (startDate === endDate) return formatDate(startDate);

    return `${formatDate(startDate)} → ${formatDate(endDate)}`;
}
