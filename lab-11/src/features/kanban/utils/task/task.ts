import type { Task } from "../../types";
import { date } from "../date/date";
import { priority } from "../priority/priority";

function view(task: Task, index: number, columnCount: number) {
    return {
        ...task,
        dateRangeLabel: date.label(task.startDate, task.endDate),
        priorityLabel: `Priority for ${task.title}`,
        priorityOptions: priority.options,
        priorityPalette: priority.metadata[task.priority].palette,
        dragLabel: `Drag ${task.title}`,
        editLabel: `Edit ${task.title}`,
        deleteLabel: `Delete task ${task.title}`,
        previous: {
            label: `Move ${task.title} left`,
            disabled: index <= 0,
            icon: "←",
        },
        next: {
            label: `Move ${task.title} right`,
            disabled: index >= columnCount - 1,
            icon: "→",
        },
    };
}

export const task = { view };
