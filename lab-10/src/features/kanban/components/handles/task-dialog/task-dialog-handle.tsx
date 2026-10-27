import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type {
    TaskErrors,
    TaskField,
    TaskFieldChange,
} from "#/features/kanban/types";
import { task } from "#/features/kanban/utils/task/task";
import { actions, command } from "#/lib/command";

const DATE_FIELDS: readonly TaskField[] = ["startDate", "endDate"];

export function TaskDialogHandle() {
    const store = useKanban();

    function close() {
        store.setTaskDialog({ open: false });
    }

    async function handleOpenCreate(payload: { columnId?: string }) {
        const columnId = payload.columnId ?? store.$firstColumnId;

        if (!columnId) return;

        store.setTaskForm(task.defaults());
        store.setTaskFormErrors({});
        store.setTaskDialog({
            open: true,
            mode: "create",
            origin: payload.columnId ? "column" : "global",
            taskId: null,
            columnId,
        });
    }

    async function handleOpenEdit(payload: { taskId: string }) {
        const current = store.tasks[payload.taskId];

        if (!current) return;

        store.setTaskForm({
            title: current.title,
            description: current.description,
            priority: current.priority,
            startDate: current.startDate,
            endDate: current.endDate,
        });
        store.setTaskFormErrors({});
        store.setTaskDialog({
            open: true,
            mode: "edit",
            origin: "column",
            taskId: current.id,
            columnId: current.columnId,
        });
    }

    async function handleChange(payload: { open: boolean }) {
        if (!payload.open) close();
    }

    /** Clears the edited field's error; date errors are re-checked live. */
    async function handleSetField(payload: TaskFieldChange) {
        store.setTaskFormField(payload.field, payload.value);

        const errors: TaskErrors = { ...store.taskFormErrors };
        delete errors[payload.field];

        if (DATE_FIELDS.includes(payload.field)) {
            const dateErrors = task.validate(store.taskForm);

            delete errors.startDate;
            delete errors.endDate;
            if (dateErrors.startDate) errors.startDate = dateErrors.startDate;
            if (dateErrors.endDate) errors.endDate = dateErrors.endDate;
        }

        store.setTaskFormErrors(errors);
    }

    async function handleSetColumn(payload: { columnId: string }) {
        if (!store.columns[payload.columnId]) return;

        store.setTaskDialog({ columnId: payload.columnId });
    }

    async function handleSubmit() {
        const { mode, taskId, columnId } = store.taskDialog;
        const fields = { ...store.taskForm };

        const result =
            mode === "edit" && taskId
                ? await actions.kanban.task.update({ taskId, ...fields })
                : await actions.kanban.task.create({
                      columnId: columnId ?? "",
                      ...fields,
                  });

        if (!result) return;

        if (!result.ok) {
            store.setTaskFormErrors(result.errors);
            return;
        }

        close();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.taskDialog.openCreate", handleOpenCreate),
            command.handle("kanban.taskDialog.openEdit", handleOpenEdit),
            command.handle("kanban.taskDialog.change", handleChange),
            command.handle("kanban.taskDialog.setField", handleSetField),
            command.handle("kanban.taskDialog.setColumn", handleSetColumn),
            command.handle("kanban.taskDialog.submit", handleSubmit),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
