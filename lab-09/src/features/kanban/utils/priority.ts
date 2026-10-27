import type { Priority } from "../types";

export const PRIORITIES: readonly Priority[] = ["low", "medium", "high"];

export const DEFAULT_PRIORITY: Priority = "medium";

export const PRIORITY_META: Record<
    Priority,
    { label: string; palette: string }
> = {
    low: { label: "Low", palette: "palette-green" },
    medium: { label: "Medium", palette: "palette-orange" },
    high: { label: "High", palette: "palette-danger" },
};

export function isPriority(value: unknown): value is Priority {
    return PRIORITIES.includes(value as Priority);
}
