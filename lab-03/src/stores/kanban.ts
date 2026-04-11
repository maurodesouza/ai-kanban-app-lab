'use client';

import { proxy, unstable_enableOp, subscribe } from 'valtio';
import type {
  KanbanStoreState,
  KanbanStores,
  Task,
  Column,
} from '@/types/kanban';
import { random } from '@/utils/random';

unstable_enableOp(true);

const kanbanStores: KanbanStores = new Map();

function createDefaultColumns(kanbanId: string): Record<string, Column> {
  const todoId = random.id();
  const inProgressId = random.id();
  const doneId = random.id();

  return {
    [todoId]: {
      id: todoId,
      kanbanId,
      title: 'To Do',
      tasksId: [],
    },
    [inProgressId]: {
      id: inProgressId,
      kanbanId,
      title: 'In Progress',
      tasksId: [],
    },
    [doneId]: {
      id: doneId,
      kanbanId,
      title: 'Done',
      tasksId: [],
    },
  };
}

function createKanbanStore(title = 'New Kanban'): KanbanStoreState {
  const kanbanId = random.id();
  const storeId = random.id();

  const store = proxy({
    id: kanbanId,
    title,
    filter: '',
    columns: createDefaultColumns(kanbanId),
    tasks: {} as Record<string, Task>,
    $$storeId: storeId,
    $columnsWithTasks: {} as Record<string, Record<string, Task>>,
  });

  function compute$columnsWithTasks() {
    const columnsWithTasks: Record<string, Record<string, Task>> = {};
    const filterText = store.filter.toLowerCase().trim();

    for (const columnId in store.columns) {
      columnsWithTasks[columnId] = {};
      const column = store.columns[columnId];

      for (const taskId of column.tasksId) {
        const task = store.tasks[taskId];
        if (task) {
          // Apply filter: check if task title or description contains filter text
          if (
            !filterText ||
            task.title.toLowerCase().includes(filterText) ||
            (task.description &&
              task.description.toLowerCase().includes(filterText))
          ) {
            columnsWithTasks[columnId][taskId] = task;
          }
        }
      }
    }

    Object.keys(store.$columnsWithTasks).forEach(key => {
      delete store.$columnsWithTasks[key];
    });

    Object.assign(store.$columnsWithTasks, columnsWithTasks);
  }

  subscribe(store, ops => {
    for (const op of ops) {
      const path = Array.isArray(op[1]) ? op[1][0] : op[1];
      if (
        typeof path === 'string' &&
        ['columns', 'tasks', 'filter'].includes(path)
      ) {
        compute$columnsWithTasks();
        break;
      }
    }
  });

  compute$columnsWithTasks();

  kanbanStores.set(storeId, store);

  return store;
}

function removeKanbanStore(storeId: string): boolean {
  return kanbanStores.delete(storeId);
}

export const kanbanStore = {
  create: createKanbanStore,
  remove: removeKanbanStore,
  getAll: () => Array.from(kanbanStores.values()),
  getById: (storeId: string) => kanbanStores.get(storeId),
  stores: kanbanStores,
};
