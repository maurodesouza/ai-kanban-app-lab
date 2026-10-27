import type { Board, Task } from "../types";

export function makeTask(
    overrides: Partial<Task> & Pick<Task, "id" | "columnId">,
): Task {
    return {
        title: `Task ${overrides.id}`,
        description: "",
        priority: "medium",
        startDate: "2026-01-10",
        endDate: "2026-01-12",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...overrides,
    };
}

/** Board with columns a, b, c; tasks t1, t2 in a and t3 in b. */
export function makeBoard(): Board {
    const tasks = [
        makeTask({ id: "t1", columnId: "a" }),
        makeTask({ id: "t2", columnId: "a" }),
        makeTask({ id: "t3", columnId: "b" }),
    ];

    return {
        columnOrder: ["a", "b", "c"],
        columns: {
            a: { id: "a", title: "To Do", taskIds: ["t1", "t2"] },
            b: { id: "b", title: "Doing", taskIds: ["t3"] },
            c: { id: "c", title: "Done", taskIds: [] },
        },
        tasks: Object.fromEntries(tasks.map((task) => [task.id, task])),
    };
}
