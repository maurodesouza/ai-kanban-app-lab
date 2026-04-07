import { create } from 'zustand';
import { Task, KanbanColumn, TaskStatus } from '@/types/task';

interface KanbanStore {
  tasks: Task[];
  columns: KanbanColumn[];
  filter: string;
}

const initialColumns: KanbanColumn[] = [
  { id: 'todo', title: 'TODO', status: TaskStatus.TODO, tasks: [] },
  { id: 'in-progress', title: 'IN PROGRESS', status: TaskStatus.IN_PROGRESS, tasks: [] },
  { id: 'done', title: 'DONE', status: TaskStatus.DONE, tasks: [] },
];

export const kanbanStore = create<KanbanStore>(() => ({
  tasks: [],
  columns: initialColumns,
  filter: '',
}));

