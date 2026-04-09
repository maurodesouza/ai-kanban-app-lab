import { proxy, subscribe } from "valtio";
import "./valtio-config"; // Enable globally

import type { KankanTask, Kanban } from "@/types/kanban";
import { random } from "@/utils/random";

type KanbanStoreState = Kanban & {
  $columnIdsWithTasks: Record<string, Record<string, KankanTask>>;
  filter: string;
};

export const kanbanStores = new Map<string, KanbanStoreState>()

export const createKanbanStore = () => {

  const state = proxy<KanbanStoreState>({
    id: "",
    title: "",
    columns: {},
    tasks: {},
    $columnIdsWithTasks: {},
    filter: ""
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
          if (!filterText || 
              task.title.toLowerCase().includes(filterText) ||
              task.description.toLowerCase().includes(filterText)) {
            columnIdsWithTasks[columnId][taskId] = task;
          }
        }
      }
    }
    
    state.$columnIdsWithTasks = columnIdsWithTasks;
  }

  subscribe(state, (ops) => {
    for (const op of ops) {
      const path = Array.isArray(op[1]) ? op[1][0] : op[1];
      if (typeof path === 'string' && ["columns", "tasks", "filter"].includes(path)) {
        compute$columnIdsWithTasks();
        break;
      }
    }
  });

  compute$columnIdsWithTasks();

  const id = random.id()
  kanbanStores.set(id, state)

  return state;
};
