import { observer } from "mobx-react-lite";
import { Clickable } from "#/components/atoms/clickable";
import { Input, Textarea } from "#/components/atoms/fields";
import { Dialog } from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { Select } from "#/components/ui/select";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";

export const TaskFormContent = observer(function TaskFormContent() {
    const ui = useKanban().$taskDraftUI;
    if (!ui) return null;
    const { values, errors } = ui;

    return (
        <Dialog.Content>
            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    void actions.task.submit();
                }}
            >
                <Dialog.Header>
                    <Dialog.Title>{ui.heading}</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body className="grid gap-3">
                    <Field.Root invalid={Boolean(errors.title)}>
                        <Field.Label htmlFor="task-title">Title</Field.Label>
                        <Field.Row>
                            <Field.Body>
                                <Input
                                    id="task-title"
                                    required
                                    value={values.title}
                                    onChange={(event) =>
                                        void actions.task.changeField({
                                            field: "title",
                                            value: event.currentTarget.value,
                                        })
                                    }
                                />
                            </Field.Body>
                        </Field.Row>
                        <Field.Error match={Boolean(errors.title)}>
                            {errors.title}
                        </Field.Error>
                    </Field.Root>
                    <Field.Root>
                        <Field.Label htmlFor="task-description">
                            Description
                        </Field.Label>
                        <Field.Row>
                            <Field.Body>
                                <Textarea
                                    id="task-description"
                                    rows={3}
                                    value={values.description}
                                    onChange={(event) =>
                                        void actions.task.changeField({
                                            field: "description",
                                            value: event.currentTarget.value,
                                        })
                                    }
                                />
                            </Field.Body>
                        </Field.Row>
                    </Field.Root>
                    <Field.Root invalid={Boolean(errors.priority)}>
                        <Field.Label htmlFor="task-priority">
                            Priority
                        </Field.Label>
                        <Select.Root
                            value={values.priority}
                            items={ui.priorities}
                            onValueChange={(value) => {
                                if (value !== null)
                                    void actions.task.changeField({
                                        field: "priority",
                                        value,
                                    });
                            }}
                        >
                            <Select.Trigger id="task-priority">
                                <Select.Value />
                            </Select.Trigger>
                            <Select.Content>
                                {ui.priorities.map(({ value, label }) => (
                                    <Select.Item key={value} value={value}>
                                        {label}
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Root>
                        <Field.Error match={Boolean(errors.priority)}>
                            {errors.priority}
                        </Field.Error>
                    </Field.Root>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field.Root invalid={Boolean(errors.startDate)}>
                            <Field.Label htmlFor="task-start-date">
                                Start date
                            </Field.Label>
                            <Field.Row>
                                <Field.Body>
                                    <Input
                                        id="task-start-date"
                                        type="date"
                                        required
                                        value={values.startDate}
                                        onChange={(event) =>
                                            void actions.task.changeField({
                                                field: "startDate",
                                                value: event.currentTarget
                                                    .value,
                                            })
                                        }
                                    />
                                </Field.Body>
                            </Field.Row>
                            <Field.Error match={Boolean(errors.startDate)}>
                                {errors.startDate}
                            </Field.Error>
                        </Field.Root>
                        <Field.Root invalid={Boolean(errors.endDate)}>
                            <Field.Label htmlFor="task-end-date">
                                End date
                            </Field.Label>
                            <Field.Row>
                                <Field.Body>
                                    <Input
                                        id="task-end-date"
                                        type="date"
                                        required
                                        value={values.endDate}
                                        onChange={(event) =>
                                            void actions.task.changeField({
                                                field: "endDate",
                                                value: event.currentTarget
                                                    .value,
                                            })
                                        }
                                    />
                                </Field.Body>
                            </Field.Row>
                            <Field.Error match={Boolean(errors.endDate)}>
                                {errors.endDate}
                            </Field.Error>
                        </Field.Root>
                    </div>
                    {ui.chooseColumn && (
                        <Field.Root invalid={Boolean(errors.columnId)}>
                            <Field.Label htmlFor="task-column">
                                Column
                            </Field.Label>
                            <Select.Root
                                value={values.columnId}
                                items={ui.columns}
                                onValueChange={(value) => {
                                    if (value !== null)
                                        void actions.task.changeField({
                                            field: "columnId",
                                            value,
                                        });
                                }}
                            >
                                <Select.Trigger id="task-column">
                                    <Select.Value />
                                </Select.Trigger>
                                <Select.Content>
                                    {ui.columns.map(({ value, label }) => (
                                        <Select.Item key={value} value={value}>
                                            {label}
                                        </Select.Item>
                                    ))}
                                </Select.Content>
                            </Select.Root>
                            <Field.Error match={Boolean(errors.columnId)}>
                                {errors.columnId}
                            </Field.Error>
                        </Field.Root>
                    )}
                    {!ui.chooseColumn && errors.columnId && (
                        <p role="alert" className="text-sm">
                            {errors.columnId}
                        </p>
                    )}
                </Dialog.Body>
                <Dialog.Footer>
                    <Clickable.Button
                        type="button"
                        variant="ghost"
                        onClick={() => void actions.modal.close()}
                    >
                        Cancel
                    </Clickable.Button>
                    <Clickable.Button type="submit" className="palette-blue">
                        {ui.submitLabel}
                    </Clickable.Button>
                </Dialog.Footer>
            </form>
        </Dialog.Content>
    );
});
