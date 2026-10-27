import type { Priority } from "#/features/kanban/types";

const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];

const META: Record<Priority, { label: string; palette: string }> = {
    low: { label: "Low", palette: "palette-green" },
    medium: { label: "Medium", palette: "palette-orange" },
    high: { label: "High", palette: "palette-rose" },
};

export const priority = {
    list: PRIORITIES,
    default: "medium" as Priority,

    is: (value: unknown): value is Priority =>
        PRIORITIES.includes(value as Priority),

    format: {
        label: (value: Priority): string => META[value].label,
        palette: (value: Priority): string => META[value].palette,
    },

    map: {
        toOption: () => (value: Priority) => ({
            value,
            label: META[value].label,
        }),
    },
};
