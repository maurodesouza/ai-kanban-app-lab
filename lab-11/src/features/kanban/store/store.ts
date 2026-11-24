import { action, computed, observable } from "mobx";
import type {
    Board,
    ColumnRenameDraft,
    DateBounds,
    Filters,
    TaskDraft,
} from "../types";
import { filter } from "../utils/filter/filter";
import { priority } from "../utils/priority/priority";
import { snapshot } from "../utils/snapshot/snapshot";
import { task } from "../utils/task/task";

export type TaskUI = ReturnType<typeof task.view>;

export class KanbanStore {
    @observable accessor board = snapshot.initialBoard();
    @observable accessor filters = snapshot.initialFilters();
    @observable accessor hydrated = false;
    @observable accessor storageError = false;
    @observable accessor columnRename: ColumnRenameDraft | null = null;
    @observable accessor taskDraft: TaskDraft | null = null;
    @observable accessor draggedTaskId: string | null = null;
    @observable accessor filterDateDraft: DateBounds | null = null;

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

    @action
    setTaskDraft(value: TaskDraft | null) {
        this.taskDraft = value;
    }

    @action
    setDraggedTaskId(value: string | null) {
        this.draggedTaskId = value;
    }

    @action
    setFilterDateDraft(value: DateBounds | null) {
        this.filterDateDraft = value;
    }

    @computed
    get $filterUI() {
        const { search, priority: selectedPriority } = this.filters;
        const { dateFrom, dateTo } = this.filterDateDraft ?? this.filters;
        return {
            search,
            dateFrom,
            dateTo,
            priority: selectedPriority,
            priorityOptions: [
                { value: "" as const, label: "All priorities" },
                ...priority.options,
            ],
            rangeInvalid: this.filterDateDraft !== null,
            rangeMessage: this.filterDateDraft
                ? "End date must be on or after the start date."
                : "",
            clearDisabled: !search && !dateFrom && !dateTo && !selectedPriority,
        };
    }

    @computed
    get $taskUI() {
        const indexes = new Map(
            this.board.columns.map((column, index) => [column.id, index]),
        );
        return new Map(
            this.board.tasks.map((entry) => [
                entry.id,
                task.view(
                    entry,
                    indexes.get(entry.columnId) ?? 0,
                    indexes.size,
                ),
            ]),
        );
    }

    @computed
    get $tasksByColumnUI() {
        const tasksByColumn = new Map<string, TaskUI[]>();
        for (const task of [...this.$taskUI.values()].filter(
            filter.matches(this.filters),
        )) {
            const tasks = tasksByColumn.get(task.columnId) ?? [];
            tasks.push(task);
            tasksByColumn.set(task.columnId, tasks);
        }
        return tasksByColumn;
    }

    @computed
    get $taskDraftUI() {
        if (!this.taskDraft) return null;
        const { values, errors, taskId, chooseColumn } = this.taskDraft;
        return {
            values,
            errors,
            chooseColumn,
            heading: taskId ? "Edit task" : "Add task",
            submitLabel: taskId ? "Save changes" : "Create task",
            columns: this.board.columns.map((column) => ({
                value: column.id,
                label: column.title,
            })),
            priorities: priority.options,
        };
    }

    @computed
    get $globalAddTaskUI() {
        return { disabled: !this.hydrated || this.board.columns.length === 0 };
    }

    @computed
    get $columnsUI() {
        const draggedColumn = this.$taskUI.get(
            this.draggedTaskId ?? "",
        )?.columnId;
        const totals = new Map<string, number>();
        for (const task of this.board.tasks) {
            totals.set(task.columnId, (totals.get(task.columnId) ?? 0) + 1);
        }
        return this.board.columns.map((column, index, columns) => {
            const total = totals.get(column.id) ?? 0;
            const visible = this.$tasksByColumnUI.get(column.id)?.length ?? 0;
            const taskCount = `${total} ${total === 1 ? "task" : "tasks"}`;
            return {
                ...column,
                titleId: `column-${column.id}-title`,
                count: visible,
                dropEnabled:
                    draggedColumn !== undefined && draggedColumn !== column.id,
                emptyMessage: visible
                    ? ""
                    : total
                      ? "No matching tasks"
                      : "No tasks",
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
