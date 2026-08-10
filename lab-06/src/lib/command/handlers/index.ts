import { command as applicationCommand, type Command } from "#/lib/command";
import { initializePersistence, type StorageLike } from "#/lib/persistence";
import { TaskDraftValidationError, validateTaskDraft } from "#/lib/validation";
import { getRootStore, type RootStore } from "#/stores";
import type { TaskDraft } from "#/types/kanban";

export type RegisterKanbanHandlersOptions = {
    stores?: RootStore;
    command?: Command;
    storage?: StorageLike;
    persistence?: boolean;
};

const activeRegistrations = new WeakMap<Command, () => void>();

export function registerKanbanHandlers(
    options: RegisterKanbanHandlersOptions = {},
): () => void {
    const stores = options.stores ?? getRootStore();
    const command = options.command ?? applicationCommand;
    activeRegistrations.get(command)?.();

    const disposes = [
        command.handle("kanban.task.add", async ({ columnId, ...draft }) => {
            stores.board.addTask(validDraft(draft), columnId);
        }),
        command.handle("kanban.task.edit", async ({ taskId, ...changes }) => {
            const task = stores.board.tasks[taskId];
            if (!task) return;
            const draft: TaskDraft = {
                title: changes.title ?? task.title,
                description: changes.description ?? task.description,
                priority: changes.priority ?? task.priority,
                startDate: changes.startDate ?? task.startDate,
                endDate: changes.endDate ?? task.endDate,
            };
            stores.board.editTask(taskId, validDraft(draft));
        }),
        command.handle("kanban.task.remove", async ({ taskId }) => {
            stores.board.removeTask(taskId);
        }),
        command.handle(
            "kanban.task.setPriority",
            async ({ taskId, priority }) => {
                stores.board.setPriority(taskId, priority);
            },
        ),
        command.handle(
            "kanban.task.move",
            async ({ taskId, columnId, index }) => {
                stores.board.moveTask(taskId, columnId, index);
            },
        ),
        command.handle(
            "kanban.task.moveAdjacent",
            async ({ taskId, direction }) => {
                stores.board.moveAdjacent(taskId, direction);
            },
        ),
        command.handle("kanban.column.add", async ({ title }) =>
            stores.board.addColumn(title),
        ),
        command.handle("kanban.column.rename", async ({ columnId, title }) => {
            stores.board.renameColumn(columnId, title);
        }),
        command.handle("kanban.column.remove", async ({ columnId }) => {
            stores.board.removeColumn(columnId);
        }),
        command.handle("kanban.column.reorder", async ({ from, to }) => {
            stores.board.reorderColumn(from, to);
        }),
        command.handle("kanban.filter.setSearch", async (search) => {
            stores.filter.setSearch(search);
        }),
        command.handle("kanban.filter.setDateRange", async (dateRange) => {
            stores.filter.setDateRange(dateRange);
        }),
        command.handle("kanban.filter.setPriorities", async (priorities) => {
            stores.filter.setPriorities(priorities);
        }),
        command.handle("kanban.filter.clear", async () => {
            stores.filter.clear();
        }),
        command.handle("dialog.openTaskForm", async (payload) => {
            stores.dialog.openTaskForm(payload);
        }),
        command.handle("dialog.openConfirm", async (payload) => {
            stores.dialog.openConfirm(payload);
        }),
        command.handle("dialog.close", async () => {
            stores.dialog.close();
        }),
        command.handle("theme.toggle", async () => {
            stores.theme.toggle();
        }),
        command.handle("theme.set", async (theme) => {
            stores.theme.set(theme);
        }),
    ];

    if (options.persistence !== false) {
        disposes.push(initializePersistence(stores, options.storage));
    }

    let disposed = false;
    const dispose = () => {
        if (disposed) return;
        disposed = true;
        disposes.forEach((disposeHandler) => {
            disposeHandler();
        });
        if (activeRegistrations.get(command) === dispose) {
            activeRegistrations.delete(command);
        }
    };
    activeRegistrations.set(command, dispose);
    return dispose;
}

function validDraft(draft: TaskDraft): TaskDraft {
    const result = validateTaskDraft(draft);
    if (!result.success) throw new TaskDraftValidationError(result.errors);
    return result.data;
}
