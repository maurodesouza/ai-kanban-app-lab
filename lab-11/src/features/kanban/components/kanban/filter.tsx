import { observer } from "mobx-react-lite";
import type { PropsWithChildren } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";

export function Filter({ children }: PropsWithChildren) {
    return (
        <fieldset className="mt-4 grid min-w-0 grid-cols-2 items-start gap-2.5 sm:grid-cols-3 lg:flex lg:items-end lg:gap-3">
            <legend className="sr-only">Task filters</legend>
            {children}
        </fieldset>
    );
}

export const SearchFilter = observer(function SearchFilter() {
    const { search } = useKanban().$filterUI;
    return (
        <Field.Root className="col-span-2 lg:w-64">
            <Field.Label htmlFor="filter-search">Search tasks</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        id="filter-search"
                        type="search"
                        value={search}
                        placeholder="Title or description"
                        onChange={(event) =>
                            void actions.filter.setSearch({
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const DateFromFilter = observer(function DateFromFilter() {
    const { dateFrom } = useKanban().$filterUI;
    return (
        <Field.Root className="min-w-0 lg:w-40">
            <Field.Label htmlFor="filter-date-from">From date</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        id="filter-date-from"
                        type="date"
                        value={dateFrom}
                        onChange={(event) =>
                            void actions.filter.setDateFrom({
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const DateToFilter = observer(function DateToFilter() {
    const { dateTo, rangeInvalid } = useKanban().$filterUI;
    return (
        <Field.Root className="min-w-0 lg:w-40" invalid={rangeInvalid}>
            <Field.Label htmlFor="filter-date-to">To date</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        id="filter-date-to"
                        type="date"
                        value={dateTo}
                        aria-describedby="date-filter-error"
                        onChange={(event) =>
                            void actions.filter.setDateTo({
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const DateFilterMessage = observer(function DateFilterMessage() {
    const { rangeMessage } = useKanban().$filterUI;
    return (
        <p
            id="date-filter-error"
            className="palette-danger mt-1 text-sm text-palette-accent empty:hidden"
            aria-live="polite"
        >
            {rangeMessage}
        </p>
    );
});

export const PriorityFilter = observer(function PriorityFilter() {
    const { priority, priorityOptions } = useKanban().$filterUI;
    return (
        <Field.Root className="min-w-0 lg:w-40">
            <Field.Label htmlFor="filter-priority">Priority</Field.Label>
            <Select.Root
                value={priority}
                items={priorityOptions}
                onValueChange={(value) => {
                    if (value !== null)
                        void actions.filter.setPriority({ value });
                }}
            >
                <Select.Trigger id="filter-priority">
                    <Select.Value />
                </Select.Trigger>
                <Select.Content>
                    {priorityOptions.map(({ value, label }) => (
                        <Select.Item key={value} value={value}>
                            {label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Field.Root>
    );
});

export const ClearFiltersAction = observer(function ClearFiltersAction() {
    const { clearDisabled } = useKanban().$filterUI;
    return (
        <Clickable.Button
            type="button"
            className="self-end"
            variant="ghost"
            disabled={clearDisabled}
            onClick={() => void actions.filter.clear()}
        >
            Clear filters
        </Clickable.Button>
    );
});
