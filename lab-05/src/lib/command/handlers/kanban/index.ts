import { actions, command } from "#/lib/command";
import { createTask, getTaskById, kanbanState } from "#/stores/kanban";
import { random } from "#/utils/random";

command.handle("kanban.column.add", async (payload) => {
    const id = random.id();

    kanbanState.columns.push({ id, title: payload.title });
    kanbanState.columnOrder.push(id);

    await actions.toast.show({
        message: `Column "${payload.title}" added`,
        type: "success",
    });
});

command.handle("kanban.column.remove", async (payload) => {
    kanbanState.columns = kanbanState.columns.filter(
        (column) => column.id !== payload.columnId,
    );
    kanbanState.tasks = kanbanState.tasks.filter(
        (task) => task.columnId !== payload.columnId,
    );
    kanbanState.columnOrder = kanbanState.columnOrder.filter(
        (id) => id !== payload.columnId,
    );

    await actions.toast.show({
        message: "Column removed",
        type: "success",
    });
});

command.handle("kanban.column.rename", async (payload) => {
    const column = kanbanState.columns.find(
        (item) => item.id === payload.columnId,
    );

    if (column) {
        column.title = payload.title;

        await actions.toast.show({
            message: `Column renamed to "${payload.title}"`,
            type: "success",
        });
    }
});

command.handle("kanban.column.reorder", async (payload) => {
    const { from, to } = payload;

    if (from === to) return;

    const order = kanbanState.columnOrder;
    const item = order[from];

    if (item) {
        order.splice(from, 1);
        order.splice(to, 0, item);

        await actions.toast.show({
            message: "Columns reordered",
            type: "success",
        });
    }
});

command.handle("kanban.task.add", async (payload) => {
    const task = createTask(
        payload.columnId,
        payload.title,
        payload.description,
    );

    kanbanState.tasks.push(task);

    await actions.toast.show({
        message: `Task "${payload.title}" added`,
        type: "success",
    });
});

command.handle("kanban.task.edit", async (payload) => {
    const task = getTaskById(payload.taskId);

    if (task) {
        task.title = payload.title;
        task.description = payload.description;

        await actions.toast.show({
            message: `Task "${payload.title}" updated`,
            type: "success",
        });
    }
});

command.handle("kanban.task.remove", async (payload) => {
    const before = kanbanState.tasks.length;
    kanbanState.tasks = kanbanState.tasks.filter(
        (task) => task.id !== payload.taskId,
    );

    if (kanbanState.tasks.length < before) {
        await actions.toast.show({
            message: "Task removed",
            type: "success",
        });
    }
});

command.handle("kanban.filter.setText", async (payload) => {
    kanbanState.filter.text = payload;

    await actions.toast.show({
        message: "Search filter updated",
        type: "info",
    });
});

command.handle("kanban.filter.setDateRange", async (payload) => {
    kanbanState.filter.dateRange = { ...payload };

    await actions.toast.show({
        message: "Date filter updated",
        type: "info",
    });
});

command.handle("kanban.filter.setStatus", async (payload) => {
    kanbanState.filter.statuses = [...payload];

    await actions.toast.show({
        message: "Status filter updated",
        type: "info",
    });
});

command.handle("kanban.filter.clear", async () => {
    kanbanState.filter = { text: "", dateRange: {}, statuses: [] };

    await actions.toast.show({
        message: "Filters cleared",
        type: "info",
    });
});
