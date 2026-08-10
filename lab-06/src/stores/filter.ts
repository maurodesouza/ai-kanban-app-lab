import { makeAutoObservable } from "mobx";
import type { DateRangeFilter, Filters, Priority, Task } from "#/types/kanban";
import type { BoardStore } from "./board";

export class FilterStore {
    search = "";
    dateRange: DateRangeFilter = {};
    priorities: Priority[] = [];

    constructor(private readonly board: BoardStore) {
        makeAutoObservable<this, "board">(
            this,
            { board: false, matches: false, filteredTaskIds: false },
            { autoBind: true },
        );
    }

    get snapshot(): Filters {
        return {
            search: this.search,
            dateRange: { ...this.dateRange },
            priorities: [...this.priorities],
        };
    }

    matches(task: Task): boolean {
        const search = this.search.trim().toLocaleLowerCase();
        if (
            search &&
            !task.title.toLocaleLowerCase().includes(search) &&
            !task.description.toLocaleLowerCase().includes(search)
        ) {
            return false;
        }

        if (
            this.priorities.length > 0 &&
            !this.priorities.includes(task.priority)
        )
            return false;
        if (this.dateRange.start && task.endDate < this.dateRange.start)
            return false;
        if (this.dateRange.end && task.startDate > this.dateRange.end)
            return false;
        return true;
    }

    filteredTaskIds(columnId: string): string[] {
        const column = this.board.columns[columnId];
        if (!column) return [];
        return column.taskIds.filter((taskId) => {
            const task = this.board.tasks[taskId];
            return task ? this.matches(task) : false;
        });
    }

    setSearch(search: string): void {
        this.search = search;
    }

    setDateRange(dateRange: DateRangeFilter): void {
        this.dateRange = { ...dateRange };
    }

    setPriorities(priorities: Priority[]): void {
        this.priorities = [...priorities];
    }

    clear(): void {
        this.search = "";
        this.dateRange = {};
        this.priorities = [];
    }
}
