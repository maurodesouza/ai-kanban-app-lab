import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { today } from "#/features/kanban/utils/date";
import { DEFAULT_PRIORITY } from "#/features/kanban/utils/priority";
import { hasErrors, validateTask } from "#/features/kanban/utils/task";
import { useTaskForm } from "#/features/task-form/hooks/use-task-form";
import { actions, command } from "#/lib/command";
import type {
    TaskFormChangePayload,
    TaskFormOpenPayload,
} from "./task-form-actions";

export function TaskFormHandle() {
    const store = useTaskForm();
    const kanban = useKanban();

    async function handleOpen(payload: TaskFormOpenPayload) {
        if (payload.mode === "edit") {
            const task = kanban.tasks[payload.taskId];

            if (!task) return;

            store.setForm({
                mode: "edit",
                taskId: task.id,
                columnId: task.columnId,
                title: task.title,
                description: task.description,
                priority: task.priority,
                startDate: task.startDate,
                endDate: task.endDate,
            });
        } else {
            const date = today();

            store.setForm({
                mode: "create",
                taskId: null,
                columnId: payload.columnId ?? null,
                title: "",
                description: "",
                priority: DEFAULT_PRIORITY,
                startDate: date,
                endDate: date,
            });
        }

        await actions.modal.open("task-form");
    }

    /** Re-validates only the errors already shown, so they clear as the user fixes them. */
    function revalidateShownErrors() {
        const { title, endDate } = validateTask(store.$values);
        const errors = { ...store.errors };

        if (errors.title) errors.title = title;
        if (errors.endDate || endDate) errors.endDate = endDate;
        if (!errors.title) delete errors.title;
        if (!errors.endDate) delete errors.endDate;

        store.setErrors(errors);
    }

    async function handleChange(payload: TaskFormChangePayload) {
        store.setField(payload.field, payload.value);
        revalidateShownErrors();
    }

    async function handleSubmit() {
        const values = store.$values;
        const errors = validateTask(values);

        if (hasErrors(errors)) return store.setErrors(errors);

        const result =
            store.mode === "edit" && store.taskId
                ? await actions.kanban.task.update({
                      taskId: store.taskId,
                      ...values,
                  })
                : await actions.kanban.task.create({
                      ...values,
                      columnId: store.columnId ?? undefined,
                  });

        if (!result) return;
        if (!result.ok) return store.setErrors(result.errors);

        await actions.modal.close();
    }

    async function handleCancel() {
        await actions.modal.close();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over stable store references
    useEffect(() => {
        const disposes = [
            command.handle("taskForm.open", handleOpen),
            command.handle("taskForm.change", handleChange),
            command.handle("taskForm.submit", handleSubmit),
            command.handle("taskForm.cancel", handleCancel),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
