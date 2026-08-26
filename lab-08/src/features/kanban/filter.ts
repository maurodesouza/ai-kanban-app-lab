import type { FilterData, TaskData } from "./types";

export function matchesFilter(task: TaskData, filter: FilterData): boolean {
    if (filter.search.trim()) {
        const q = filter.search.trim().toLowerCase();
        const inTitle = task.title.toLowerCase().includes(q);
        const inDesc = task.description.toLowerCase().includes(q);
        if (!inTitle && !inDesc) return false;
    }

    if (filter.priority !== "all" && task.priority !== filter.priority) {
        return false;
    }

    if (filter.dateFrom && task.endDate < filter.dateFrom) return false;
    if (filter.dateTo && task.startDate > filter.dateTo) return false;

    return true;
}
