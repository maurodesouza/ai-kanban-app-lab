import { useEffect } from "react";
import { actions, command } from "#/lib/command";
import { useKanban } from "../../../hooks/use-kanban";
import type {
    Direction,
    Priority,
    TaskErrors,
    TaskFieldChange,
} from "../../../types";
import { date } from "../../../utils/date/date";
import { priority } from "../../../utils/priority/priority";
import { TaskFormContent } from "../../dialogs/task-form-content";

type TaskId = { taskId: string };

export function TaskHandle() {
    const store = useKanban();

    async function openCreate({ columnId }: { columnId?: string }) {
        const destination = columnId ?? store.board.columns[0]?.id;
        if (
            !destination ||
            !store.board.columns.some((column) => column.id === destination)
        )
            return;
        const today = date.localDay(new Date());
        store.setTaskDraft({
            taskId: null,
            chooseColumn: columnId === undefined,
            values: {
                title: "",
                description: "",
                priority: "medium",
                startDate: today,
                endDate: today,
                columnId: destination,
            },
            errors: {},
        });
        await actions.modal.open(TaskFormContent);
    }

    async function openEdit({ taskId }: TaskId) {
        const task = store.board.tasks.find((entry) => entry.id === taskId);
        if (!task) return;
        const { id, ...values } = task;
        store.setTaskDraft({
            taskId: id,
            chooseColumn: false,
            values,
            errors: {},
        });
        await actions.modal.open(TaskFormContent);
    }

    async function changeField({ field, value }: TaskFieldChange) {
        const draft = store.taskDraft;
        if (!draft || (field === "columnId" && !draft.chooseColumn)) return;
        const errors = { ...draft.errors, [field]: undefined };
        if (field === "startDate") errors.endDate = undefined;
        store.setTaskDraft({
            ...draft,
            values: { ...draft.values, [field]: value },
            errors,
        });
    }

    async function submit() {
        const { board, taskDraft: draft } = store;
        if (!draft) return;

        const values = { ...draft.values, title: draft.values.title.trim() };
        const current = board.tasks.find((task) => task.id === draft.taskId);
        const columnId = current?.columnId ?? values.columnId;
        const errors: TaskErrors = {};
        if (!values.title) errors.title = "Enter a task title.";
        if (!priority.is(values.priority))
            errors.priority = "Choose a priority.";
        if (!date.isDay(values.startDate))
            errors.startDate = "Enter a valid start date.";
        if (!date.isDay(values.endDate))
            errors.endDate = "Enter a valid end date.";
        else if (!errors.startDate && values.endDate < values.startDate) {
            errors.endDate = "End date must be on or after the start date.";
        }
        if (
            !board.columns.some((column) => column.id === columnId) ||
            (draft.taskId && !current)
        ) {
            errors.columnId = "The task or column is no longer available.";
        }
        if (Object.keys(errors).length > 0) {
            store.setTaskDraft({ ...draft, errors });
            return;
        }

        const nextTask = {
            ...values,
            id: current?.id ?? crypto.randomUUID(),
            columnId,
        };
        const tasks = current
            ? board.tasks.map((task) =>
                  task.id === current.id ? nextTask : task,
              )
            : [...board.tasks, nextTask];
        store.setBoard({ ...board, tasks });
        store.setTaskDraft(null);
        await actions.modal.close();
    }

    async function remove({ taskId }: TaskId) {
        const { board } = store;
        if (!board.tasks.some((task) => task.id === taskId)) return;
        store.setBoard({
            ...board,
            tasks: board.tasks.filter((task) => task.id !== taskId),
        });
    }

    async function setPriority({
        taskId,
        priority: value,
    }: TaskId & { priority: Priority }) {
        const { board } = store;
        const task = board.tasks.find((entry) => entry.id === taskId);
        if (!task || !priority.is(value) || task.priority === value) return;
        store.setBoard({
            ...board,
            tasks: board.tasks.map((entry) =>
                entry.id === taskId ? { ...entry, priority: value } : entry,
            ),
        });
    }

    async function move(
        payload: TaskId & ({ columnId: string } | { direction: Direction }),
    ) {
        const { board } = store;
        const task = board.tasks.find((entry) => entry.id === payload.taskId);
        if (!task) return;
        const index = board.columns.findIndex(
            (column) => column.id === task.columnId,
        );
        const destination =
            "columnId" in payload
                ? board.columns.find((column) => column.id === payload.columnId)
                : board.columns[
                      index + (payload.direction === "previous" ? -1 : 1)
                  ];
        if (!destination || destination.id === task.columnId) return;
        store.setBoard({
            ...board,
            tasks: [
                ...board.tasks.filter((entry) => entry.id !== task.id),
                { ...task, columnId: destination.id },
            ],
        });
    }

    async function dragStart({ taskId }: TaskId) {
        if (store.board.tasks.some((task) => task.id === taskId))
            store.setDraggedTaskId(taskId);
    }

    async function drop({ columnId }: { columnId: string }) {
        const taskId = store.draggedTaskId;
        if (!taskId) return;
        store.setDraggedTaskId(null);
        await actions.task.move({ taskId, columnId });
    }

    async function dragEnd({ taskId }: TaskId) {
        if (store.draggedTaskId === taskId) store.setDraggedTaskId(null);
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: handlers close over the stable board store
    useEffect(() => {
        const dispose = [
            command.handle("task.openCreate", openCreate),
            command.handle("task.openEdit", openEdit),
            command.handle("task.changeField", changeField),
            command.handle("task.submit", submit),
            command.handle("task.delete", remove),
            command.handle("task.setPriority", setPriority),
            command.handle("task.move", move),
            command.handle("task.dragStart", dragStart),
            command.handle("task.drop", drop),
            command.handle("task.dragEnd", dragEnd),
        ];
        return () => {
            for (const unregister of dispose) unregister();
        };
    }, [store]);

    return null;
}
