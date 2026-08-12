import { Search, X } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Button } from "#/components/shared/clickable/button";
import { DateInput } from "#/components/shared/fields/date-input";
import { Input } from "#/components/shared/fields/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { actions } from "#/lib/command";
import { kanbanStore } from "#/stores";
import type { Priority } from "#/types/domain";

export const FilterBar = observer(function FilterBar() {
    const { filters } = kanbanStore;

    const hasActiveFilters =
        filters.search !== "" ||
        filters.priority !== "all" ||
        filters.dateRange.start !== null ||
        filters.dateRange.end !== null;

    function clearFilters() {
        actions.kanban.task.filter({
            filter: {
                search: "",
                priority: "all",
                dateRange: { start: null, end: null },
            },
        });
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Search tasks..."
                    value={filters.search}
                    onChange={(e) =>
                        actions.kanban.task.filter({
                            filter: { search: e.target.value },
                        })
                    }
                    className="h-9 w-48 pl-8"
                />
            </div>

            <Select
                value={filters.priority}
                onValueChange={(value) =>
                    actions.kanban.task.filter({
                        filter: { priority: value as Priority | "all" },
                    })
                }
            >
                <SelectTrigger className="h-9 w-32">
                    <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                </SelectContent>
            </Select>

            <DateInput
                value={filters.dateRange.start ?? ""}
                onChange={(e) =>
                    actions.kanban.task.filter({
                        filter: {
                            dateRange: {
                                start: e.target.value || null,
                                end: filters.dateRange.end,
                            },
                        },
                    })
                }
                className="h-9 w-36"
                placeholder="Start date"
            />
            <span className="text-xs text-muted-foreground">→</span>
            <DateInput
                value={filters.dateRange.end ?? ""}
                onChange={(e) =>
                    actions.kanban.task.filter({
                        filter: {
                            dateRange: {
                                start: filters.dateRange.start,
                                end: e.target.value || null,
                            },
                        },
                    })
                }
                className="h-9 w-36"
                placeholder="End date"
            />

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-9 px-2"
                >
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    );
});
