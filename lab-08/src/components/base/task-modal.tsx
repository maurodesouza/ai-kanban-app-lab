import { useEffect, useMemo, useState } from "react";
import type { TaskModalData } from "#/components/handles/modal/modal-actions";
import { Button } from "#/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import { kanbanStore } from "#/features/kanban/store/kanban-store";
import {
    PRIORITY_LABELS,
    PRIORITY_ORDER,
    type Priority,
} from "#/features/kanban/types";
import { actions } from "#/lib/command";

interface TaskModalProps {
    data: TaskModalData;
    onClose: () => void;
}

function todayISO(): string {
    return new Date().toISOString().slice(0, 10);
}

interface FormValues {
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
    columnId: string;
}

interface FormErrors {
    title?: string;
    endDate?: string;
}

function validate(values: FormValues): FormErrors {
    const errors: FormErrors = {};
    if (!values.title.trim()) {
        errors.title = "Title is required";
    }
    if (values.endDate < values.startDate) {
        errors.endDate = "End date cannot be before start date";
    }
    return errors;
}

export function TaskModal({ data, onClose }: TaskModalProps) {
    const board = kanbanStore.getBoard(data.boardId);
    const columns = useMemo(
        () => (board ? kanbanStore.getColumns(data.boardId) : []),
        [board, data.boardId],
    );

    const existingTask =
        data.mode === "edit" && data.taskId
            ? kanbanStore.getTask(data.boardId, data.taskId)
            : undefined;

    const [values, setValues] = useState<FormValues>(() => ({
        title: existingTask?.title ?? "",
        description: existingTask?.description ?? "",
        priority: existingTask?.priority ?? "none",
        startDate: existingTask?.startDate ?? todayISO(),
        endDate: existingTask?.endDate ?? todayISO(),
        columnId:
            existingTask?.columnId ?? data.columnId ?? columns[0]?.id ?? "",
    }));

    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (data.mode === "create" && !values.columnId && columns[0]) {
            setValues((v) => ({ ...v, columnId: columns[0].id }));
        }
    }, [columns, data.mode, values.columnId]);

    function updateField<K extends keyof FormValues>(
        key: K,
        value: FormValues[K],
    ) {
        setValues((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "startDate" && value > prev.endDate) {
                next.endDate = value;
            }
            return next;
        });
        setTouched((t) => ({ ...t, [key]: true }));
    }

    function handleSubmit() {
        const allTouched = Object.fromEntries(
            Object.keys(values).map((k) => [k, true]),
        );
        setTouched(allTouched);
        const validationErrors = validate(values);
        if (Object.keys(validationErrors).length > 0) return;

        if (data.mode === "create") {
            actions.kanban.task.add(
                {
                    boardId: data.boardId,
                    columnId: values.columnId,
                    title: values.title.trim(),
                    description: values.description.trim(),
                    priority: values.priority,
                    startDate: values.startDate,
                    endDate: values.endDate,
                },
                { instanceId: data.boardId },
            );
        } else if (data.mode === "edit" && data.taskId) {
            actions.kanban.task.edit(
                {
                    boardId: data.boardId,
                    taskId: data.taskId,
                    patch: {
                        title: values.title.trim(),
                        description: values.description.trim(),
                        priority: values.priority,
                        startDate: values.startDate,
                        endDate: values.endDate,
                        columnId: values.columnId,
                    },
                },
                { instanceId: data.boardId },
            );
        }
        onClose();
    }

    const liveErrors = validate(values);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {data.mode === "create" ? "New Task" : "Edit Task"}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            value={values.title}
                            onChange={(e) =>
                                updateField("title", e.target.value)
                            }
                            onBlur={() =>
                                setTouched((t) => ({ ...t, title: true }))
                            }
                            placeholder="Task title"
                        />
                        {touched.title && liveErrors.title && (
                            <span className="text-sm text-destructive">
                                {liveErrors.title}
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                            id="task-description"
                            value={values.description}
                            onChange={(e) =>
                                updateField("description", e.target.value)
                            }
                            placeholder="Task description (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label>Priority</Label>
                        <Select
                            value={values.priority}
                            onValueChange={(v) =>
                                updateField("priority", v as Priority)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITY_ORDER.map((p) => (
                                    <SelectItem key={p} value={p}>
                                        {PRIORITY_LABELS[p]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-start">Start date</Label>
                            <Input
                                id="task-start"
                                type="date"
                                value={values.startDate}
                                onChange={(e) =>
                                    updateField("startDate", e.target.value)
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="task-end">End date</Label>
                            <Input
                                id="task-end"
                                type="date"
                                value={values.endDate}
                                onChange={(e) =>
                                    updateField("endDate", e.target.value)
                                }
                                onBlur={() =>
                                    setTouched((t) => ({
                                        ...t,
                                        endDate: true,
                                    }))
                                }
                            />
                            {touched.endDate && liveErrors.endDate && (
                                <span className="text-sm text-destructive">
                                    {liveErrors.endDate}
                                </span>
                            )}
                        </div>
                    </div>

                    {data.mode === "create" && (
                        <div className="flex flex-col gap-2">
                            <Label>Column</Label>
                            <Select
                                value={values.columnId}
                                onValueChange={(v) =>
                                    updateField("columnId", v)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {columns.map((col) => (
                                        <SelectItem key={col.id} value={col.id}>
                                            {col.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                        {data.mode === "create" ? "Add Task" : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
