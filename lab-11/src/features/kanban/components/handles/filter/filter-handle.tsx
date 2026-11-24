import { runInAction } from "mobx";
import { useEffect } from "react";
import { command } from "#/lib/command";
import { useKanban } from "../../../hooks/use-kanban";
import type { DateBounds, Filters } from "../../../types";
import { date } from "../../../utils/date/date";
import { snapshot } from "../../../utils/snapshot/snapshot";

export function FilterHandle() {
    const store = useKanban();

    function changeDate(bound: keyof DateBounds, value: string) {
        if (value !== "" && !date.isDay(value)) return;
        const { dateFrom, dateTo } = store.filterDateDraft ?? store.filters;
        const next = { dateFrom, dateTo, [bound]: value };
        if (next.dateFrom && next.dateTo && next.dateTo < next.dateFrom) {
            store.setFilterDateDraft(next);
            return;
        }
        runInAction(() => {
            store.setFilterDateDraft(null);
            store.setFilters({ ...store.filters, ...next });
        });
    }

    async function setDateFrom({ value }: { value: string }) {
        changeDate("dateFrom", value);
    }

    async function setDateTo({ value }: { value: string }) {
        changeDate("dateTo", value);
    }

    async function setSearch({ value }: { value: string }) {
        store.setFilters({ ...store.filters, search: value });
    }

    async function setPriority({ value }: { value: Filters["priority"] }) {
        store.setFilters({ ...store.filters, priority: value });
    }

    async function clear() {
        runInAction(() => {
            store.setFilterDateDraft(null);
            store.setFilters(snapshot.initialFilters());
        });
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable board store
    useEffect(() => {
        const dispose = [
            command.handle("filter.setSearch", setSearch),
            command.handle("filter.setDateFrom", setDateFrom),
            command.handle("filter.setDateTo", setDateTo),
            command.handle("filter.setPriority", setPriority),
            command.handle("filter.clear", clear),
        ];
        return () => {
            for (const unregister of dispose) unregister();
        };
    }, [store]);

    return null;
}
