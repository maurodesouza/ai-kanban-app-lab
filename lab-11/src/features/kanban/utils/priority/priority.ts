import { type Priority, priorities } from "../../types";

const metadata = {
    low: { label: "Low", palette: "palette-green" },
    medium: { label: "Medium", palette: "palette-blue" },
    high: { label: "High", palette: "palette-orange" },
} satisfies Record<Priority, { label: string; palette: string }>;

export const priority = {
    options: priorities.map((value) => ({ value, ...metadata[value] })),
    metadata,
    is(value: unknown): value is Priority {
        return priorities.some((candidate) => candidate === value);
    },
};
