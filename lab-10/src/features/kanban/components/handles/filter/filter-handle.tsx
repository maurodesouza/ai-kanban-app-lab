import { useEffect } from "react";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { PriorityFilter } from "#/features/kanban/types";
import { date } from "#/features/kanban/utils/date/date";
import { priority } from "#/features/kanban/utils/priority/priority";
import { command } from "#/lib/command";

function toDateFilter(value: string): string {
    return date.is.isoDate(value) ? value : "";
}

export function FilterHandle() {
    const store = useKanban();

    async function handleSetSearch(payload: { search: string }) {
        store.setFilters({ search: payload.search });
    }

    /** Keeps the range valid: a start after the end pulls the end along. */
    async function handleSetDateFrom(payload: { date: string }) {
        const dateFrom = toDateFilter(payload.date);
        const { dateTo } = store.filters;

        if (dateFrom && dateTo && date.is.before(dateTo, dateFrom)) {
            store.setFilters({ dateFrom, dateTo: dateFrom });
            return;
        }

        store.setFilters({ dateFrom });
    }

    /** Keeps the range valid: an end before the start pulls the start along. */
    async function handleSetDateTo(payload: { date: string }) {
        const dateTo = toDateFilter(payload.date);
        const { dateFrom } = store.filters;

        if (dateFrom && dateTo && date.is.before(dateTo, dateFrom)) {
            store.setFilters({ dateFrom: dateTo, dateTo });
            return;
        }

        store.setFilters({ dateTo });
    }

    async function handleSetPriority(payload: { priority: PriorityFilter }) {
        const isValid =
            payload.priority === "all" || priority.is(payload.priority);

        if (!isValid) return;

        store.setFilters({ priority: payload.priority });
    }

    async function handleClear() {
        store.resetFilters();
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable store reference
    useEffect(() => {
        const disposes = [
            command.handle("kanban.filter.setSearch", handleSetSearch),
            command.handle("kanban.filter.setDateFrom", handleSetDateFrom),
            command.handle("kanban.filter.setDateTo", handleSetDateTo),
            command.handle("kanban.filter.setPriority", handleSetPriority),
            command.handle("kanban.filter.clear", handleClear),
        ];

        return () => {
            for (const dispose of disposes) dispose();
        };
    }, []);

    return null;
}
