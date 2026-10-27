import type { Priority, Task } from "../types";
import { isDateString } from "./date";
import { isPriority } from "./priority";

export const FILTERS_STORAGE_KEY = "lab-09:kanban-filters";

export const DATE_RANGE_ERROR = "The range start must be before its end.";

export type PriorityFilter = "all" | Priority;

export type Filters = {
    search: string;
    dateFrom: string;
    dateTo: string;
    priority: PriorityFilter;
};

export function createEmptyFilters(): Filters {
    return { search: "", dateFrom: "", dateTo: "", priority: "all" };
}

export function isPriorityFilter(value: unknown): value is PriorityFilter {
    return value === "all" || isPriority(value);
}

function matchesSearch(task: Task, search: string) {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query)
    );
}

/** A task matches when its [start, end] overlaps [from, to]; each bound is optional. */
function matchesDateRange(task: Task, from: string, to: string) {
    return (!from || task.endDate >= from) && (!to || task.startDate <= to);
}

export function matchesFilters(
    task: Task,
    filters: Filters,
    applyDateRange: boolean,
) {
    return (
        matchesSearch(task, filters.search) &&
        (!applyDateRange ||
            matchesDateRange(task, filters.dateFrom, filters.dateTo)) &&
        (filters.priority === "all" || task.priority === filters.priority)
    );
}

export function parseStoredFilters(value: unknown): Filters | null {
    if (typeof value !== "object" || value === null) return null;

    const { search, dateFrom, dateTo, priority } = value as Filters;

    const isValid =
        typeof search === "string" &&
        (dateFrom === "" || isDateString(dateFrom)) &&
        (dateTo === "" || isDateString(dateTo)) &&
        isPriorityFilter(priority);

    return isValid ? { search, dateFrom, dateTo, priority } : null;
}
