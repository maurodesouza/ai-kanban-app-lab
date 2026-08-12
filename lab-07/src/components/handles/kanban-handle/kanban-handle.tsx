import { useEffect } from "react";
import { command } from "#/lib/command";

export function KanbanHandle() {
    async function handleTaskAdd() {}
    async function handleTaskEdit() {}
    async function handleTaskDelete() {}
    async function handleTaskMove() {}
    async function handleTaskPrioritySet() {}
    async function handleTaskFilter() {}
    async function handleColumnAdd() {}
    async function handleColumnCreate() {}
    async function handleColumnRename() {}
    async function handleColumnMove() {}
    async function handleColumnDelete() {}

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers register once on mount
    useEffect(() => {
        const disposes = [
            command.handle("kanban.task.add", handleTaskAdd),
            command.handle("kanban.task.edit", handleTaskEdit),
            command.handle("kanban.task.delete", handleTaskDelete),
            command.handle("kanban.task.move", handleTaskMove),
            command.handle("kanban.task.priority.set", handleTaskPrioritySet),
            command.handle("kanban.task.filter", handleTaskFilter),
            command.handle("kanban.column.add", handleColumnAdd),
            command.handle("kanban.column.create", handleColumnCreate),
            command.handle("kanban.column.rename", handleColumnRename),
            command.handle("kanban.column.move", handleColumnMove),
            command.handle("kanban.column.delete", handleColumnDelete),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
