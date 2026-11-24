import type { Filters, Task } from "../../types";

export const filter = {
    matches(filters: Filters) {
        const search = filters.search.trim().toLowerCase();
        return (task: Task) =>
            (!search ||
                task.title.toLowerCase().includes(search) ||
                task.description.toLowerCase().includes(search)) &&
            (!filters.dateFrom || task.endDate >= filters.dateFrom) &&
            (!filters.dateTo || task.startDate <= filters.dateTo) &&
            (!filters.priority || task.priority === filters.priority);
    },
};
