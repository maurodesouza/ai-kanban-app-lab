'use client';

import { proxy } from 'valtio';
import { subscribeKey } from 'valtio/utils';
import type {
  KanbanStoreState,
  KanbanStores,
  Task,
  Column,
} from '@/types/kanban';
import { random } from '@/utils/random';

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

  function updateColumnsWithTasks() {
    const result: Record<string, Record<string, Task>> = {};

    Object.entries(store.columns).forEach(([columnId, column]) => {
      result[columnId] = {};

      column.tasksId.forEach((taskId: string) => {
        const task = store.tasks[taskId];
        if (!task) return;

        if (
          store.filter &&
          !task.title.toLowerCase().includes(store.filter.toLowerCase())
        ) {
          return;
        }

        result[columnId][taskId] = task;
      });
    });

    store.$columnsWithTasks = result;
  }

  updateColumnsWithTasks();

  subscribeKey(store, 'tasks', updateColumnsWithTasks);
  subscribeKey(store, 'columns', updateColumnsWithTasks);
  subscribeKey(store, 'filter', updateColumnsWithTasks);

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
