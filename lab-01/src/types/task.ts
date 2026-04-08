export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  DONE = 'done'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface KanbanColumn {
  id: string;
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color?: string;
}

export interface FilterCriteria {
  query: string;
  active: boolean;
}

export interface ApplicationState {
  tasks: Task[];
  columns: KanbanColumn[];
  filter: FilterCriteria;
  ui: UIState;
}

export interface UIState {
  isTaskModalOpen: boolean;
  selectedTaskId?: string;
  draggedTaskId?: string;
  loading: boolean;
  error?: string;
}
