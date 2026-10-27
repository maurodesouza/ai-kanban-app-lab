import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { PriorityFilter } from "#/features/kanban/utils/filter";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type PartProps = { children?: ReactNode; className?: string };

const FIELD_PALETTE = "palette-surface-blue";

export function Container({ children, className }: PartProps) {
    return (
        <search
            className={cn(
                "flex flex-1 flex-wrap items-start gap-2 sm:justify-end",
                className,
            )}
        >
            {children}
        </search>
    );
}

export const Search = observer(function Search() {
    const store = useKanban();
    const { label, placeholder, value } = store.$searchFilterUI;

    return (
        <Field.Root className={cn(FIELD_PALETTE, "w-full sm:w-64")}>
            <Field.Row>
                <Field.Body>
                    <Field.Inset>
                        <SearchIcon className="size-4" />
                    </Field.Inset>
                    <Input
                        type="search"
                        aria-label={label}
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) =>
                            actions.kanban.filter.search({
                                value: event.target.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const DateRange = observer(function DateRange() {
    const store = useKanban();
    const { fromLabel, toLabel, from, to, error, isInvalid } =
        store.$dateRangeFilterUI;

    return (
        <Field.Root invalid={isInvalid} className={cn(FIELD_PALETTE, "w-auto")}>
            <div className="flex items-center gap-2">
                <Field.Row className="w-40">
                    <Field.Body>
                        <Input
                            type="date"
                            aria-label={fromLabel}
                            title={fromLabel}
                            value={from}
                            onChange={(event) =>
                                actions.kanban.filter.dateRange({
                                    from: event.target.value,
                                    to,
                                })
                            }
                        />
                    </Field.Body>
                </Field.Row>
                <Field.Row className="w-40">
                    <Field.Body>
                        <Input
                            type="date"
                            aria-label={toLabel}
                            title={toLabel}
                            value={to}
                            onChange={(event) =>
                                actions.kanban.filter.dateRange({
                                    from,
                                    to: event.target.value,
                                })
                            }
                        />
                    </Field.Body>
                </Field.Row>
            </div>
            {isInvalid && <Field.Error match>{error}</Field.Error>}
        </Field.Root>
    );
});

export const Priority = observer(function Priority() {
    const store = useKanban();
    const { label, value, options } = store.$priorityFilterUI;

    return (
        <Field.Root className={cn(FIELD_PALETTE, "w-40")}>
            <Select.Root
                items={options}
                value={value}
                onValueChange={(next) =>
                    actions.kanban.filter.priority({
                        priority: next as PriorityFilter,
                    })
                }
            >
                <Select.Trigger aria-label={label}>
                    <Select.Value />
                </Select.Trigger>
                <Select.Content>
                    {options.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                            {option.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Field.Root>
    );
});

export const Clear = observer(function Clear() {
    const store = useKanban();
    const { label, disabled } = store.$clearFiltersUI;

    return (
        <Clickable.Button
            variant="ghost"
            disabled={disabled}
            onClick={() => actions.kanban.filter.clear()}
        >
            <XIcon />
            {label}
        </Clickable.Button>
    );
});
