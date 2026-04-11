'use client';

import { useEffect } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import { kanbanStore } from '@/stores/kanban';
import { random } from '@/utils/random';
import type {
  FilterPayload,
  CreateTaskPayload,
  UpdateTaskPayload,
  DeleteTaskPayload,
  MoveTaskPayload,
  CreateColumnPayload,
  UpdateColumnPayload,
  DeleteColumnPayload,
  MoveColumnPayload,
} from '@/events/handles/kanban';

function KanbanHandler() {
  function onFilter(event: CustomEvent<FilterPayload>) {
    const { storeId, filter } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store) return;

    store.filter = filter;
  }

  function onCreateTask(event: CustomEvent<CreateTaskPayload>) {
    const { storeId, data } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store) return;

    const newTask = {
      ...data,
      id: random.id(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.tasks[newTask.id] = newTask;

    // Add task to column
    const column = store.columns[newTask.columnId];
    if (column) {
      column.tasksId.push(newTask.id);
    }

    // Show success notification
    events.notification.success({
      message: 'Task created successfully!',
      description: `"${newTask.title}" has been added to ${column?.title || 'column'}`,
      duration: 3000,
    });
  }

  function onUpdateTask(event: CustomEvent<UpdateTaskPayload>) {
    const { storeId, taskId, data } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.tasks[taskId]) return;

    const task = store.tasks[taskId];
    const oldTitle = task.title;
    Object.assign(task, data);
    task.updatedAt = new Date().toISOString();

    // Show success notification
    events.notification.success({
      message: 'Task updated successfully!',
      description: `"${oldTitle}" has been updated`,
      duration: 3000,
    });
  }

  function onDeleteTask(event: CustomEvent<DeleteTaskPayload>) {
    const { storeId, taskId } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.tasks[taskId]) return;

    const task = store.tasks[taskId];
    const taskTitle = task.title;

    // Remove task ID from column
    const column = store.columns[task.columnId];
    if (column) {
      column.tasksId = column.tasksId.filter(id => id !== taskId);
    }

    // Remove task from store
    delete store.tasks[taskId];

    // Show success notification
    events.notification.info({
      message: 'Task deleted',
      description: `"${taskTitle}" has been removed`,
      duration: 3000,
    });
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

    // Show success notification
    events.notification.success({
      message: 'Task moved!',
      description: `"${task.title}" moved to ${toColumn.title}`,
      duration: 2000,
    });
  }

  function onCreateColumn(event: CustomEvent<CreateColumnPayload>) {
    const { storeId, data } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store) return;

    const newColumn = {
      ...data,
      id: random.id(),
    };

    store.columns[newColumn.id] = newColumn;

    // Show success notification
    events.notification.success({
      message: 'Column created successfully!',
      description: `"${newColumn.title}" has been added`,
      duration: 3000,
    });
  }

  function onUpdateColumn(event: CustomEvent<UpdateColumnPayload>) {
    const { storeId, columnId, data } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.columns[columnId]) return;

    const column = store.columns[columnId];
    const oldTitle = column.title;

    // Update column data
    Object.assign(column, data);

    // Show success notification
    events.notification.success({
      message: 'Column updated successfully!',
      description: `"${oldTitle}" has been renamed to "${column.title}"`,
      duration: 3000,
    });
  }

  function onDeleteColumn(event: CustomEvent<DeleteColumnPayload>) {
    const { storeId, columnId } = event.detail;
    const store = kanbanStore.getById(storeId);

    if (!store || !store.columns[columnId]) return;

    const column = store.columns[columnId];
    const columnTitle = column.title;
    const taskIds = column.tasksId;

    // Delete all tasks in the column using existing events
    taskIds.forEach(taskId => {
      if (store.tasks[taskId]) {
        events.kanban.deleteTask({
          storeId,
          taskId,
        });
      }
    });

    // Remove column from store
    delete store.columns[columnId];

    // Show success notification
    const taskCount = taskIds.length;
    const description =
      taskCount > 0
        ? `"${columnTitle}" and ${taskCount} task${taskCount > 1 ? 's' : ''} have been deleted`
        : `"${columnTitle}" has been deleted`;

    events.notification.info({
      message: 'Column deleted',
      description,
      duration: 3000,
    });
  }

  // Helper function to move column in any direction
  function moveColumnInDirection(
    storeId: string,
    columnId: string,
    direction: 'left' | 'right'
  ) {
    const store = kanbanStore.getById(storeId);

    if (!store || !store.columns[columnId]) return false;

    // Get current column order
    const columnIds = Object.keys(store.columns);
    const currentIndex = columnIds.indexOf(columnId);

    // Calculate new index based on direction
    const newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;

    // Validate bounds
    if (newIndex < 0 || newIndex >= columnIds.length) return false;

    // Get the column to move and target column
    const columnToMove = store.columns[columnId];
    const targetColumnId = columnIds[newIndex];
    const targetColumn = store.columns[targetColumnId];

    if (!columnToMove || !targetColumn) return false;

    // Create new columns object with swapped order
    const newColumns: typeof store.columns = {};
    columnIds.forEach((id, index) => {
      if (index === newIndex) {
        // Place the moved column at new position
        newColumns[columnId] = columnToMove;
      }
      if (index === currentIndex) {
        // Place the target column at old position
        newColumns[targetColumnId] = targetColumn;
      } else if (index !== newIndex && index !== currentIndex) {
        // Keep other columns in their positions
        newColumns[id] = store.columns[id];
      }
    });

    // Update store with new column order
    store.columns = newColumns;

    // Show success notification
    events.notification.success({
      message: 'Column moved',
      description: `"${columnToMove.title}" moved ${direction}`,
      duration: 2000,
    });

    return true;
  }

  function onMoveColumnLeft(event: CustomEvent<MoveColumnPayload>) {
    const { storeId, columnId } = event.detail;
    moveColumnInDirection(storeId, columnId, 'left');
  }

  function onMoveColumnRight(event: CustomEvent<MoveColumnPayload>) {
    const { storeId, columnId } = event.detail;
    moveColumnInDirection(storeId, columnId, 'right');
  }

  useEffect(() => {
    events.on(Events.KANBAN_FILTER, onFilter);
    events.on(Events.KANBAN_TASK_CREATE, onCreateTask);
    events.on(Events.KANBAN_TASK_UPDATE, onUpdateTask);
    events.on(Events.KANBAN_TASK_DELETE, onDeleteTask);
    events.on(Events.KANBAN_TASK_MOVE, onMoveTask);
    events.on(Events.KANBAN_COLUMN_CREATE, onCreateColumn);
    events.on(Events.KANBAN_COLUMN_UPDATE, onUpdateColumn);
    events.on(Events.KANBAN_COLUMN_DELETE, onDeleteColumn);
    events.on(Events.KANBAN_COLUMN_MOVE_LEFT, onMoveColumnLeft);
    events.on(Events.KANBAN_COLUMN_MOVE_RIGHT, onMoveColumnRight);

    return () => {
      events.off(Events.KANBAN_FILTER, onFilter);
      events.off(Events.KANBAN_TASK_CREATE, onCreateTask);
      events.off(Events.KANBAN_TASK_UPDATE, onUpdateTask);
      events.off(Events.KANBAN_TASK_DELETE, onDeleteTask);
      events.off(Events.KANBAN_TASK_MOVE, onMoveTask);
      events.off(Events.KANBAN_COLUMN_CREATE, onCreateColumn);
      events.off(Events.KANBAN_COLUMN_UPDATE, onUpdateColumn);
      events.off(Events.KANBAN_COLUMN_DELETE, onDeleteColumn);
      events.off(Events.KANBAN_COLUMN_MOVE_LEFT, onMoveColumnLeft);
      events.off(Events.KANBAN_COLUMN_MOVE_RIGHT, onMoveColumnRight);
    };
  }, []);

  return null;
}

export { KanbanHandler };
