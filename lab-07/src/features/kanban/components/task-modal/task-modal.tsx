import { observer } from "mobx-react-lite";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "#/components/shared/clickable/button";
import { DateInput } from "#/components/shared/fields/date-input";
import { Input } from "#/components/shared/fields/input";
import { Textarea } from "#/components/shared/fields/textarea";
import { Label } from "#/components/shared/text/label";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "#/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "#/components/ui/select";
import { actions } from "#/lib/command";
import { kanbanStore, modalStore } from "#/stores";
import type { Priority, TaskInput } from "#/types/domain";

function today(): string {
    return new Date().toISOString().slice(0, 10);
}

function getInitialInput(): TaskInput {
    const editingTask = modalStore.editingTaskId
        ? kanbanStore.tasks.get(modalStore.editingTaskId)
        : null;

    if (editingTask) {
        return {
            title: editingTask.title,
            description: editingTask.description,
            priority: editingTask.priority,
            startDate: editingTask.startDate,
            endDate: editingTask.endDate,
        };
    }

    return {
        title: "",
        description: "",
        priority: "medium",
        startDate: today(),
        endDate: today(),
    };
}

export const TaskModal = observer(function TaskModal() {
    const [input, setInput] = useState<TaskInput>(getInitialInput);
    const [titleError, setTitleError] = useState<string | null>(null);
    const [dateError, setDateError] = useState<string | null>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: mobx observables trigger re-sync when modal opens
    useEffect(() => {
        if (modalStore.isTaskModalOpen) {
            setInput(getInitialInput());
            setTitleError(null);
            setDateError(null);
        }
    }, [modalStore.isTaskModalOpen, modalStore.editingTaskId]);

    const isEdit = modalStore.mode === "edit";

    function validate(): boolean {
        let valid = true;

        if (!input.title.trim()) {
            setTitleError("Title is required");
            valid = false;
        } else {
            setTitleError(null);
        }

        if (input.endDate < input.startDate) {
            setDateError("End date must be on or after the start date");
            valid = false;
        } else {
            setDateError(null);
        }

        return valid;
    }

    function handleSubmit(e: FormEvent) {
        e.preventDefault();
        if (!validate()) return;

        if (isEdit && modalStore.editingTaskId) {
            actions.kanban.task.edit({
                taskId: modalStore.editingTaskId,
                input,
            });
        } else {
            actions.kanban.task.add({
                input,
                columnId: modalStore.columnId ?? undefined,
            });
        }

        actions.modal.close();
    }

    return (
        <Dialog
            open={modalStore.isTaskModalOpen}
            onOpenChange={(open) => {
                if (!open) actions.modal.close();
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {isEdit ? "Edit Task" : "Create Task"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-title">Title</Label>
                        <Input
                            id="task-title"
                            value={input.title}
                            onChange={(e) =>
                                setInput({ ...input, title: e.target.value })
                            }
                        />
                        {titleError && (
                            <p className="text-xs text-destructive">
                                {titleError}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="task-description">Description</Label>
                        <Textarea
                            id="task-description"
                            value={input.description}
                            onChange={(e) =>
                                setInput({
                                    ...input,
                                    description: e.target.value,
                                })
                            }
                            rows={3}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>Priority</Label>
                        <Select
                            value={input.priority}
                            onValueChange={(value) =>
                                setInput({
                                    ...input,
                                    priority: value as Priority,
                                })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="task-start">Start Date</Label>
                            <DateInput
                                id="task-start"
                                value={input.startDate}
                                onChange={(e) =>
                                    setInput({
                                        ...input,
                                        startDate: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="task-end">End Date</Label>
                            <DateInput
                                id="task-end"
                                value={input.endDate}
                                onChange={(e) =>
                                    setInput({
                                        ...input,
                                        endDate: e.target.value,
                                    })
                                }
                            />
                            {dateError && (
                                <p className="text-xs text-destructive">
                                    {dateError}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => actions.modal.close()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit">
                            {isEdit ? "Save Changes" : "Create Task"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
});
