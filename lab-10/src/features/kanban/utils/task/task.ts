import type {
    Task,
    TaskErrors,
    TaskFields,
    TaskFilters,
} from "#/features/kanban/types";
import { date } from "#/features/kanban/utils/date/date";
import { priority } from "#/features/kanban/utils/priority/priority";

function validateTaskFields(fields: TaskFields): TaskErrors {
    const errors: TaskErrors = {};

    if (!fields.title.trim()) errors.title = "Title is required";
    if (!date.is.isoDate(fields.startDate))
        errors.startDate = "Pick a start date";
    if (!date.is.isoDate(fields.endDate)) errors.endDate = "Pick an end date";

    if (!errors.startDate && !errors.endDate) {
        if (date.is.before(fields.endDate, fields.startDate)) {
            errors.endDate = "End date can't be before the start date";
        }
    }

    return errors;
}

function createTask(
    id: string,
    columnId: string,
    fields: TaskFields,
    now: string,
): Task {
    return {
        id,
        columnId,
        ...task.normalize(fields),
        createdAt: now,
        updatedAt: now,
    };
}

function matchesFilters(filters: TaskFilters) {
    const search = filters.search.trim().toLowerCase();

    return (item: Task): boolean => {
        if (filters.priority !== "all" && item.priority !== filters.priority) {
            return false;
        }

        if (
            !date.has.overlap(
                item.startDate,
                item.endDate,
                filters.dateFrom,
                filters.dateTo,
            )
        ) {
            return false;
        }

        if (!search) return true;

        return (
            item.title.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search)
        );
    };
}

export const task = {
    create: createTask,

    defaults: (): TaskFields => ({
        title: "",
        description: "",
        priority: priority.default,
        startDate: date.today(),
        endDate: date.today(),
    }),

    normalize: (fields: TaskFields): TaskFields => ({
        ...fields,
        title: fields.title.trim(),
        description: fields.description.trim(),
    }),

    validate: validateTaskFields,

    filter: {
        byFilters: matchesFilters,
    },

    has: {
        errors: (errors: TaskErrors): boolean => Object.keys(errors).length > 0,
    },
};
