import { proxy, subscribe } from "valtio";
import "./valtio-config"; // Enable globally

import type { KankanTask, KanbanColumn, Kanban } from "@/types/kanban";

type KanbanStoreState = Kanban & {
  $columnIdsWithTasks: Record<string, Record<string, KankanTask>>;
};

export const createKanbanStore = () => {
  const state = proxy<KanbanStoreState>({
    id: "",
    title: "",
    columns: {},
    tasks: {},
    $columnIdsWithTasks: {}
  });

  function compute$columnIdsWithTasks() {
    const columnIdsWithTasks: Record<string, Record<string, KankanTask>> = {};
    
    for (const columnId in state.columns) {
      columnIdsWithTasks[columnId] = {};
      const column = state.columns[columnId];
      
      for (const taskId of column.tasksId) {
        const task = state.tasks[taskId];
        if (task) {
          columnIdsWithTasks[columnId][taskId] = task;
        }
      }
    }
    
    state.$columnIdsWithTasks = columnIdsWithTasks;
  }

  subscribe(state, (ops) => {
    for (const op of ops) {
      const path = Array.isArray(op[1]) ? op[1][0] : op[1];
      if (typeof path === 'string' && ["columns", "tasks"].includes(path)) {
        compute$columnIdsWithTasks();
        break;
      }
    }
  });

  compute$columnIdsWithTasks();

  return state;
};
