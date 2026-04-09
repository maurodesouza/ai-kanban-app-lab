import { proxy, subscribe } from 'valtio';
import './valtio-config'; // Enable globally

import type { KankanTask, Kanban } from '@/types/kanban';
import { random } from '@/utils/random';

export type KanbanStoreState = Kanban & {
  $columnIdsWithTasks: Record<string, Record<string, KankanTask>>;
  filter: string;
  $$storeId: string;
};

const kanbanId = random.id();
const todoColumnId = random.id();
const progressColumnId = random.id();
const doneColumnId = random.id();

const initialKanbanState: KanbanStoreState = {
  id: kanbanId,
  title: 'AI Todo App',
  filter: '',
  tasks: {},

  columns: {
    [todoColumnId]: {
      id: todoColumnId,
      kanbanId: kanbanId,
      title: 'To Do',
      tasksId: [],
    },
    [progressColumnId]: {
      id: progressColumnId,
      kanbanId: kanbanId,
      title: 'In Progress',
      tasksId: [],
    },
    [doneColumnId]: {
      id: doneColumnId,
      kanbanId: kanbanId,
      title: 'Done',
      tasksId: [],
    },
  },

  $columnIdsWithTasks: {},
  $$storeId: '',
};

export const kanbanStores = new Map<string, KanbanStoreState>();

export const removeKanbanStore = (storeId: string) => {
  kanbanStores.delete(storeId);
};

export const createKanbanStore = () => {
  const storeId = random.id();

  const state = proxy<KanbanStoreState>({
    ...initialKanbanState,
    $$storeId: storeId,
  });

  function compute$columnIdsWithTasks() {
    const columnIdsWithTasks: Record<string, Record<string, KankanTask>> = {};
    const filterText = state.filter.toLowerCase().trim();

    for (const columnId in state.columns) {
      columnIdsWithTasks[columnId] = {};
      const column = state.columns[columnId];

      for (const taskId of column.tasksId) {
        const task = state.tasks[taskId];
        if (task) {
          // Apply filter: check if task title or description contains filter text
          if (
            !filterText ||
            task.title.toLowerCase().includes(filterText) ||
            (task.description &&
              task.description.toLowerCase().includes(filterText))
          ) {
            columnIdsWithTasks[columnId][taskId] = task;
          }
        }
      }
    }

    Object.keys(state.$columnIdsWithTasks).forEach(key => {
      delete state.$columnIdsWithTasks[key];
    });

    Object.assign(state.$columnIdsWithTasks, columnIdsWithTasks);
  }

  subscribe(state, ops => {
    for (const op of ops) {
      const path = Array.isArray(op[1]) ? op[1][0] : op[1];
      if (
        typeof path === 'string' &&
        ['columns', 'tasks', 'filter'].includes(path)
      ) {
        compute$columnIdsWithTasks();
        break;
      }
    }
  });

  compute$columnIdsWithTasks();

  kanbanStores.set(storeId, state);

  return state;
};
