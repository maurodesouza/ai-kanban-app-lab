import { SearchIcon, XIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ComponentProps } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { PriorityFilter } from "#/features/kanban/types";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

export function Container({ className, ...props }: ComponentProps<"search">) {
    return (
        <search
            className={cn("flex flex-wrap items-center gap-2", className)}
            {...props}
        />
    );
}

export const Search = observer(() => {
    const store = useKanban();
    const { value, placeholder, label } = store.$filterUI.search;

    return (
        <Field.Root className="palette-surface-blue w-56">
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
                            actions.kanban.filter.setSearch({
                                search: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const DateRange = observer(() => {
    const store = useKanban();
    const { dateFrom, dateTo } = store.$filterUI;

    return (
        <div className="flex items-center gap-1">
            <Field.Root className="palette-surface-blue w-36">
                <Field.Row>
                    <Field.Body>
                        <Input
                            type="date"
                            aria-label={dateFrom.label}
                            value={dateFrom.value}
                            onChange={(event) =>
                                actions.kanban.filter.setDateFrom({
                                    date: event.currentTarget.value,
                                })
                            }
                        />
                    </Field.Body>
                </Field.Row>
            </Field.Root>
            <span aria-hidden className="text-palette-accent/85 text-xs">
                –
            </span>
            <Field.Root className="palette-surface-blue w-36">
                <Field.Row>
                    <Field.Body>
                        <Input
                            type="date"
                            aria-label={dateTo.label}
                            value={dateTo.value}
                            onChange={(event) =>
                                actions.kanban.filter.setDateTo({
                                    date: event.currentTarget.value,
                                })
                            }
                        />
                    </Field.Body>
                </Field.Row>
            </Field.Root>
        </div>
    );
});

export const Priority = observer(() => {
    const store = useKanban();
    const { value, label, options } = store.$filterUI.priority;

    return (
        <Field.Root className="palette-surface-blue w-40">
            <Select.Root
                items={options}
                value={value}
                onValueChange={(next) =>
                    actions.kanban.filter.setPriority({
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

export const Clear = observer(() => {
    const store = useKanban();
    const { showClear, clearLabel } = store.$filterUI;

    if (!showClear) return null;

    return (
        <Clickable.Button
            variant="ghost"
            size="sm"
            onClick={() => actions.kanban.filter.clear()}
        >
            <XIcon />
            {clearLabel}
        </Clickable.Button>
    );
});
