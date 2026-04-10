'use client';

import { proxy } from 'valtio';
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

    get $columnsWithTasks() {
      const result: Record<string, Record<string, Task>> = {};

      Object.entries(this.columns).forEach(([columnId, column]) => {
        result[columnId] = {};

        column.tasksId.forEach((taskId: string) => {
          const task = this.tasks[taskId];
          if (!task) return;

          if (
            this.filter &&
            !task.title.toLowerCase().includes(this.filter.toLowerCase())
          ) {
            return;
          }

          result[columnId][taskId] = task;
        });
      });

      return result;
    },
  });

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
