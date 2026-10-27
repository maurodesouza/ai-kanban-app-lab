import { observer } from "mobx-react-lite";
import type { FormEvent, ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input, Textarea } from "#/components/atoms/fields";
import { Dialog } from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import type { Priority } from "#/features/kanban/types";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    actions.kanban.taskDialog.submit();
}

export const Root = observer(({ children }: { children: ReactNode }) => {
    const store = useKanban();
    const { open } = store.$taskDialogUI;

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(next) =>
                actions.kanban.taskDialog.change({ open: next })
            }
        >
            <Dialog.Portal>
                <Dialog.Backdrop />
                <Dialog.Content>
                    <form
                        noValidate
                        onSubmit={handleSubmit}
                        className="contents"
                    >
                        {children}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
});

export const Header = Dialog.Header;

export const Footer = Dialog.Footer;

export function Body({ children }: { children: ReactNode }) {
    return <Dialog.Body className="gap-4">{children}</Dialog.Body>;
}

export const Title = observer(() => {
    const store = useKanban();
    const { title } = store.$taskDialogUI;

    return <Dialog.Title>{title}</Dialog.Title>;
});

export const Description = observer(() => {
    const store = useKanban();
    const { description } = store.$taskDialogUI;

    return <Dialog.Description>{description}</Dialog.Description>;
});

export function Row({
    className,
    children,
}: {
    className?: string;
    children: ReactNode;
}) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
            {children}
        </div>
    );
}

export const ColumnField = observer(() => {
    const store = useKanban();
    const { showColumnSelect, column } = store.$taskDialogUI;

    if (!showColumnSelect) return null;

    return (
        <Field.Root className="palette-surface-blue">
            <Field.Label>Column</Field.Label>
            <Select.Root
                items={column.options}
                value={column.value}
                onValueChange={(value) =>
                    actions.kanban.taskDialog.setColumn({
                        columnId: String(value),
                    })
                }
            >
                <Select.Trigger>
                    <Select.Value />
                </Select.Trigger>
                <Select.Content>
                    {column.options.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                            {option.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Field.Root>
    );
});

export const TitleField = observer(() => {
    const store = useKanban();
    const { value, error, invalid } = store.$taskDialogUI.fields.title;

    return (
        <Field.Root className="palette-surface-blue" invalid={invalid}>
            <Field.Label>Title</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        name="title"
                        placeholder="What needs to be done?"
                        value={value}
                        onChange={(event) =>
                            actions.kanban.taskDialog.setField({
                                field: "title",
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
            {invalid && <Field.Error match>{error}</Field.Error>}
        </Field.Root>
    );
});

export const DescriptionField = observer(() => {
    const store = useKanban();
    const { value } = store.$taskDialogUI.fields.description;

    return (
        <Field.Root className="palette-surface-blue">
            <Field.Label>Description</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Textarea
                        name="description"
                        rows={3}
                        placeholder="Add more details (optional)"
                        value={value}
                        onChange={(event) =>
                            actions.kanban.taskDialog.setField({
                                field: "description",
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const PriorityField = observer(() => {
    const store = useKanban();
    const { priorityOptions, fields } = store.$taskDialogUI;

    return (
        <Field.Root className="palette-surface-blue">
            <Field.Label>Priority</Field.Label>
            <Select.Root
                items={priorityOptions}
                value={fields.priority.value}
                onValueChange={(value) =>
                    actions.kanban.taskDialog.setField({
                        field: "priority",
                        value: value as Priority,
                    })
                }
            >
                <Select.Trigger>
                    <Select.Value />
                </Select.Trigger>
                <Select.Content>
                    {priorityOptions.map((option) => (
                        <Select.Item key={option.value} value={option.value}>
                            {option.label}
                        </Select.Item>
                    ))}
                </Select.Content>
            </Select.Root>
        </Field.Root>
    );
});

type DateFieldProps = {
    field: "startDate" | "endDate";
    label: string;
};

export const DateField = observer(({ field, label }: DateFieldProps) => {
    const store = useKanban();
    const { value, error, invalid } = store.$taskDialogUI.fields[field];

    return (
        <Field.Root className="palette-surface-blue" invalid={invalid}>
            <Field.Label>{label}</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        type="date"
                        name={field}
                        value={value}
                        onChange={(event) =>
                            actions.kanban.taskDialog.setField({
                                field,
                                value: event.currentTarget.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
            {invalid && <Field.Error match>{error}</Field.Error>}
        </Field.Root>
    );
});

export const Cancel = observer(() => {
    const store = useKanban();
    const { cancelLabel } = store.$taskDialogUI;

    return (
        <Dialog.Close render={<Clickable.Button variant="outline" />}>
            {cancelLabel}
        </Dialog.Close>
    );
});

export const Submit = observer(() => {
    const store = useKanban();
    const { submitLabel } = store.$taskDialogUI;

    return (
        <Clickable.Button type="submit" className="palette-blue">
            {submitLabel}
        </Clickable.Button>
    );
});
