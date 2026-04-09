'use client';

import { useEffect } from 'react';

import { events } from '@/events';
import { Events } from '@/types/events';
import type {
  AddTaskEventPayload,
  EditTaskEventPayload,
  DeleteTaskEventPayload,
  FilterEventPayload,
  DragStartEventPayload,
  DragEndEventPayload,
} from '@/events/handles/kanban';
import { kanbanStores } from '@/stores/kanban';

function KanbanHandler() {
  // Event handlers for kanban events
  function handleTaskAdd(event: CustomEvent<AddTaskEventPayload>) {
    const payload = event.detail;
    console.log('Kanban task add event received:', payload);

    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Add the new task to the store
    kanbanStore.tasks[payload.data.id] = payload.data;

    // If the task has a columnId, add it to that column
    if (!payload.data.columnId) {
      return;
    }

    const column = kanbanStore.columns[payload.data.columnId];
    if (!column) {
      console.error(
        `Column ${payload.data.columnId} not found in kanban store`
      );
      return;
    }

    // Add task to column if not already there
    if (column.tasksId.includes(payload.data.id)) {
      return;
    }

    column.tasksId.push(payload.data.id);
  }

  function handleTaskEdit(event: CustomEvent<EditTaskEventPayload>) {
    const payload = event.detail;

    console.log('Kanban task edit event received:', payload);

    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);

    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Get the existing task
    const existingTask = kanbanStore.tasks[payload.data.id];
    if (!existingTask) {
      console.error(`Task ${payload.data.id} not found in kanban store`);
      return;
    }

    // Update the task
    kanbanStore.tasks[payload.data.id] = { ...existingTask, ...payload.data };

    // Handle column change if needed
    if (
      !payload.data.columnId ||
      payload.data.columnId === existingTask.columnId
    ) {
      return;
    }

    // Remove from old column
    if (existingTask.columnId) {
      const oldColumn = kanbanStore.columns[existingTask.columnId];
      if (oldColumn) {
        const taskIndex = oldColumn.tasksId.indexOf(payload.data.id);
        if (taskIndex > -1) {
          oldColumn.tasksId.splice(taskIndex, 1);
        }
      }
    }

    // Add to new column
    const newColumn = kanbanStore.columns[payload.data.columnId];
    if (!newColumn) {
      return;
    }

    if (!newColumn.tasksId.includes(payload.data.id)) {
      newColumn.tasksId.push(payload.data.id);
    }
  }

  function handleTaskDelete(event: CustomEvent<DeleteTaskEventPayload>) {
    const payload = event.detail;
    console.log('Kanban task delete event received:', payload);

    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Get the task to be deleted
    const taskToDelete = kanbanStore.tasks[payload.data];
    if (!taskToDelete) {
      console.error(`Task ${payload.data} not found in kanban store`);
      return;
    }

    // Remove task from its column
    if (!taskToDelete.columnId) {
      delete kanbanStore.tasks[payload.data];
      return;
    }

    const column = kanbanStore.columns[taskToDelete.columnId];
    if (!column) {
      delete kanbanStore.tasks[payload.data];
      return;
    }

    const taskIndex = column.tasksId.indexOf(payload.data);
    if (taskIndex > -1) {
      column.tasksId.splice(taskIndex, 1);
    }

    // Remove task from store
    delete kanbanStore.tasks[payload.data];
  }

  function handleFilter(event: CustomEvent<FilterEventPayload>) {
    const payload = event.detail;
    console.log('Kanban filter event received:', payload);

    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Update filter in store
    kanbanStore.filter = payload.filter;
  }

  function handleDragStart(event: CustomEvent<DragStartEventPayload>) {
    const payload = event.detail;
    console.log('Kanban drag start event received:', payload);
    // Could add visual feedback here if needed
  }

  function handleDragEnd(event: CustomEvent<DragEndEventPayload>) {
    const payload = event.detail;
    console.log('Kanban drag end event received:', payload);

    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    const { taskId, fromColumnId, toColumnId, toIndex } = payload;

    // Validate columns exist
    const fromColumn = kanbanStore.columns[fromColumnId];
    const toColumn = kanbanStore.columns[toColumnId];

    if (!fromColumn) {
      console.error(`From column ${fromColumnId} not found`);
      return;
    }

    if (!toColumn) {
      console.error(`To column ${toColumnId} not found`);
      return;
    }

    // Don't do anything if the task is being dropped in the same column at the same position
    if (fromColumnId === toColumnId) {
      const currentIndex = fromColumn.tasksId.indexOf(taskId);

      if (toIndex === undefined || currentIndex === toIndex) {
        return;
      }
    }

    // Remove task from original column
    const taskIndex = fromColumn.tasksId.indexOf(taskId);
    if (taskIndex !== -1) {
      fromColumn.tasksId.splice(taskIndex, 1);
    }

    // Add task to new column at specified position
    if (toIndex !== undefined && toIndex < toColumn.tasksId.length) {
      toColumn.tasksId.splice(toIndex, 0, taskId);
    } else {
      toColumn.tasksId.push(taskId);
    }

    // Update task's columnId
    const task = kanbanStore.tasks[taskId];
    if (task) {
      task.columnId = toColumnId;
    }
  }

  useEffect(() => {
    events.on(Events.KANBAN_TASK_ADD, handleTaskAdd);
    events.on(Events.KANBAN_TASK_EDIT, handleTaskEdit);
    events.on(Events.KANBAN_TASK_DELETE, handleTaskDelete);
    events.on(Events.KANBAN_FILTER, handleFilter);
    events.on(Events.KANBAN_DRAG_START, handleDragStart);
    events.on(Events.KANBAN_DRAG_END, handleDragEnd);

    return () => {
      events.off(Events.KANBAN_TASK_ADD, handleTaskAdd);
      events.off(Events.KANBAN_TASK_EDIT, handleTaskEdit);
      events.off(Events.KANBAN_TASK_DELETE, handleTaskDelete);
      events.off(Events.KANBAN_FILTER, handleFilter);
      events.off(Events.KANBAN_DRAG_START, handleDragStart);
      events.off(Events.KANBAN_DRAG_END, handleDragEnd);
    };
  }, []);

  return null; // Handler components are typically invisible
}

export { KanbanHandler };
