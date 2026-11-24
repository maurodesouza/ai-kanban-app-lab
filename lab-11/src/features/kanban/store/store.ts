import { action, computed, observable } from "mobx";
import type { Board, ColumnRenameDraft, Filters } from "../types";
import { snapshot } from "../utils/snapshot/snapshot";

export class KanbanStore {
    @observable accessor board = snapshot.initialBoard();
    @observable accessor filters = snapshot.initialFilters();
    @observable accessor hydrated = false;
    @observable accessor storageError = false;
    @observable accessor columnRename: ColumnRenameDraft | null = null;

    @action
    setBoard(value: Board) {
        this.board = value;
    }

    @action
    setFilters(value: Filters) {
        this.filters = value;
    }

    @action
    setHydrated(value: boolean) {
        this.hydrated = value;
    }

    @action
    setStorageError(value: boolean) {
        this.storageError = value;
    }

    @action
    setColumnRename(value: ColumnRenameDraft | null) {
        this.columnRename = value;
    }

    @computed
    get $tasksByColumnUI() {
        const tasksByColumn = new Map<string, Board["tasks"]>();
        for (const task of this.board.tasks) {
            const tasks = tasksByColumn.get(task.columnId) ?? [];
            tasks.push(task);
            tasksByColumn.set(task.columnId, tasks);
        }
        return tasksByColumn;
    }

    @computed
    get $columnsUI() {
        return this.board.columns.map((column, index, columns) => {
            const total = this.board.tasks.filter(
                (task) => task.columnId === column.id,
            ).length;
            const visible = this.$tasksByColumnUI.get(column.id)?.length ?? 0;
            const taskCount = `${total} ${total === 1 ? "task" : "tasks"}`;
            return {
                ...column,
                titleId: `column-${column.id}-title`,
                count: visible,
                emptyMessage: visible === 0 ? "No tasks" : "",
                renameLabel: `Rename ${column.title}`,
                deleteLabel: `Delete ${column.title}`,
                addTaskLabel: `Add task to ${column.title}`,
                previous: {
                    label: `Move ${column.title} column left`,
                    disabled: index === 0,
                    icon: "←",
                },
                next: {
                    label: `Move ${column.title} column right`,
                    disabled: index === columns.length - 1,
                    icon: "→",
                },
                confirmation: {
                    title: `Delete ${column.title}?`,
                    description:
                        total === 0
                            ? "This column will be permanently deleted."
                            : `This column and its ${taskCount} will be permanently deleted.`,
                },
            };
        });
    }

    @computed
    get $columnUI() {
        return new Map(this.$columnsUI.map((column) => [column.id, column]));
    }

    @computed
    get $columnRenameUI() {
        if (!this.columnRename) return null;
        return {
            ...this.columnRename,
            titleId: "rename-column-title",
            invalid: this.columnRename.error !== "",
        };
    }

    @computed
    get $statusUI() {
        return {
            ready: this.hydrated,
            storageMessage: this.storageError
                ? "Board changes may not be saved in this browser."
                : "",
        };
    }
}
