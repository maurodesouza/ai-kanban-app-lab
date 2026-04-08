export type KankanTask = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  kanbanId: string;
  columnId: string;
  createdAt: string;
  updatedAt: string;
};

export type KanbanColumn = {
  id: string;
  kanbanId: string;
  title: string;
  tasksId: string[];
};

export type Kanban = {
  id: string;
  title: string;
  columns: Record<string, KanbanColumn>;
  tasks: Record<string, KankanTask>;
};
