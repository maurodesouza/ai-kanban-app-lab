export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  kanbanId: string;
  columnId: string;
  createdAt: string;
  updatedAt: string;
};

export type Column = {
  id: string;
  kanbanId: string;
  title: string;
  tasksId: string[];
};

export type Kanban = {
  id: string;
  title: string;
  filter: string;
  columns: Record<string, Column>;
  tasks: Record<string, Task>;
};

export type KanbanStoreState = Kanban & {
  $$storeId: string;
  $columnsWithTasks: Record<string, Record<string, Task>>;
};

export type KanbanStores = Map<string, KanbanStoreState>;
