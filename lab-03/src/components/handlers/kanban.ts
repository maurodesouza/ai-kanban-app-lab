'use client';

import { useEffect } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import { kanbanStore } from '@/stores/kanban';
import { random } from '@/utils/random';
import type {
  CreateTaskPayload,
  UpdateTaskPayload,
  DeleteTaskPayload,
  MoveTaskPayload,
} from '@/events/handles/kanban';

function KanbanHandler() {
  function onCreateTask(event: CustomEvent<CreateTaskPayload>) {
    const { storeId, task } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store) return;

    const newTask = {
      ...task,
      id: random.id(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add task to store
    store.tasks[newTask.id] = newTask;

    // Add task ID to column
    const column = store.columns[task.columnId];
    if (column) {
      column.tasksId.push(newTask.id);
    }
  }

  function onUpdateTask(event: CustomEvent<UpdateTaskPayload>) {
    const { storeId, taskId, updates } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.tasks[taskId]) return;

    // Update task with new data
    Object.assign(store.tasks[taskId], {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  function onDeleteTask(event: CustomEvent<DeleteTaskPayload>) {
    const { storeId, taskId } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.tasks[taskId]) return;

    const task = store.tasks[taskId];

    // Remove task ID from column
    const column = store.columns[task.columnId];
    if (column) {
      column.tasksId = column.tasksId.filter(id => id !== taskId);
    }

    // Remove task from store
    delete store.tasks[taskId];
  }

  function onMoveTask(event: CustomEvent<MoveTaskPayload>) {
    const { storeId, taskId, fromColumnId, toColumnId, newIndex } =
      event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.tasks[taskId]) return;

    const task = store.tasks[taskId];
    const fromColumn = store.columns[fromColumnId];
    const toColumn = store.columns[toColumnId];

    if (!fromColumn || !toColumn) return;

    // Remove task from source column
    fromColumn.tasksId = fromColumn.tasksId.filter(id => id !== taskId);

    // Add task to target column
    if (
      newIndex !== undefined &&
      newIndex >= 0 &&
      newIndex <= toColumn.tasksId.length
    ) {
      toColumn.tasksId.splice(newIndex, 0, taskId);
    } else {
      toColumn.tasksId.push(taskId);
    }

    // Update task column reference
    task.columnId = toColumnId;
    task.updatedAt = new Date().toISOString();
  }

  useEffect(() => {
    events.on(Events.KANBAN_TASK_CREATE, onCreateTask);
    events.on(Events.KANBAN_TASK_UPDATE, onUpdateTask);
    events.on(Events.KANBAN_TASK_DELETE, onDeleteTask);
    events.on(Events.KANBAN_TASK_MOVE, onMoveTask);

    return () => {
      events.off(Events.KANBAN_TASK_CREATE, onCreateTask);
      events.off(Events.KANBAN_TASK_UPDATE, onUpdateTask);
      events.off(Events.KANBAN_TASK_DELETE, onDeleteTask);
      events.off(Events.KANBAN_TASK_MOVE, onMoveTask);
    };
  }, []);

  return null;
}

export { KanbanHandler };
