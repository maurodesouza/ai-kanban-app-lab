import { observer } from "mobx-react-lite";
import type { ReactNode } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Input, Textarea } from "#/components/atoms/fields";
import { Text } from "#/components/atoms/text";
import { Dialog } from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import type { Priority as PriorityValue } from "#/features/kanban/types";
import { useTaskForm } from "#/features/task-form/hooks/use-task-form";
import { useModal } from "#/hooks/use-modal";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

type PartProps = { children?: ReactNode; className?: string };

const FIELD_PALETTE = "palette-surface-blue";

export const FormDialog = observer(function FormDialog({
    children,
}: PartProps) {
    const modal = useModal();

    return (
        <Dialog.Root
            open={modal.$isTaskFormOpen}
            onOpenChange={(open) => {
                if (!open) actions.taskForm.cancel();
            }}
        >
            <Dialog.Portal>
                <Dialog.Backdrop />
                <Dialog.Content>
                    <form
                        noValidate
                        className="flex flex-col gap-4"
                        onSubmit={(event) => {
                            event.preventDefault();
                            actions.taskForm.submit();
                        }}
                    >
                        {children}
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
});

export function Header({ children }: PartProps) {
    return <Dialog.Header>{children}</Dialog.Header>;
}

export const Title = observer(function Title() {
    const store = useTaskForm();

    return <Dialog.Title>{store.$dialogUI.title}</Dialog.Title>;
});

export const Description = observer(function Description() {
    const store = useTaskForm();

    return (
        <Dialog.Description>{store.$dialogUI.description}</Dialog.Description>
    );
});

export function Body({ children }: PartProps) {
    return <Dialog.Body>{children}</Dialog.Body>;
}

export function Row({ children, className }: PartProps) {
    return (
        <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
            {children}
        </div>
    );
}

export const TitleField = observer(function TitleField() {
    const store = useTaskForm();
    const { label, placeholder, value, error, isInvalid } = store.$titleFieldUI;

    return (
        <Field.Root invalid={isInvalid} className={FIELD_PALETTE}>
            <Field.Label>{label}</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        autoFocus
                        name="title"
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) =>
                            actions.taskForm.change({
                                field: "title",
                                value: event.target.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
            {isInvalid && <Field.Error match>{error}</Field.Error>}
        </Field.Root>
    );
});

export const DescriptionField = observer(function DescriptionField() {
    const store = useTaskForm();
    const { label, placeholder, value } = store.$descriptionFieldUI;

    return (
        <Field.Root className={FIELD_PALETTE}>
            <Field.Label>{label}</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Textarea
                        name="description"
                        rows={3}
                        placeholder={placeholder}
                        value={value}
                        onChange={(event) =>
                            actions.taskForm.change({
                                field: "description",
                                value: event.target.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const PriorityField = observer(function PriorityField() {
    const store = useTaskForm();
    const { label, value, options } = store.$priorityFieldUI;

    return (
        <Field.Root className={FIELD_PALETTE}>
            <Field.Label>{label}</Field.Label>
            <Select.Root
                items={options}
                value={value}
                onValueChange={(next) =>
                    actions.taskForm.change({
                        field: "priority",
                        value: next as PriorityValue,
                    })
                }
            >
                <Select.Trigger>
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

export const StartDateField = observer(function StartDateField() {
    const store = useTaskForm();
    const { label, value } = store.$startDateFieldUI;

    return (
        <Field.Root className={FIELD_PALETTE}>
            <Field.Label>{label}</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        type="date"
                        name="startDate"
                        value={value}
                        onChange={(event) =>
                            actions.taskForm.change({
                                field: "startDate",
                                value: event.target.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
        </Field.Root>
    );
});

export const EndDateField = observer(function EndDateField() {
    const store = useTaskForm();
    const { label, value, min, error, isInvalid } = store.$endDateFieldUI;

    return (
        <Field.Root invalid={isInvalid} className={FIELD_PALETTE}>
            <Field.Label>{label}</Field.Label>
            <Field.Row>
                <Field.Body>
                    <Input
                        type="date"
                        name="endDate"
                        min={min}
                        value={value}
                        onChange={(event) =>
                            actions.taskForm.change({
                                field: "endDate",
                                value: event.target.value,
                            })
                        }
                    />
                </Field.Body>
            </Field.Row>
            {isInvalid && <Field.Error match>{error}</Field.Error>}
        </Field.Root>
    );
});

export const FormError = observer(function FormError() {
    const store = useTaskForm();
    const { hasError, message } = store.$formErrorUI;

    if (!hasError) return null;

    return <Text.Error role="alert">{message}</Text.Error>;
});

export function Footer({ children }: PartProps) {
    return <Dialog.Footer>{children}</Dialog.Footer>;
}

export const Cancel = observer(function Cancel() {
    const store = useTaskForm();

    return (
        <Clickable.Button
            type="button"
            variant="outline"
            onClick={() => actions.taskForm.cancel()}
        >
            {store.$cancelUI.label}
        </Clickable.Button>
    );
});

export const Submit = observer(function Submit() {
    const store = useTaskForm();
    const { label, disabled } = store.$submitUI;

    return (
        <Clickable.Button
            type="submit"
            className="palette-blue"
            disabled={disabled}
        >
            {label}
        </Clickable.Button>
    );
});
