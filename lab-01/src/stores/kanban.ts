import { create } from 'zustand';
import { Task, KanbanColumn, TaskStatus } from '@/types/task';
import { useTasks } from '@/hooks/use-tasks';
import { useFilter } from '@/hooks/use-filter';

interface KanbanStore {
  tasks: Task[];
  columns: KanbanColumn[];
  filter: string;
  setFilter: (query: string) => void;
}

const initialColumns: KanbanColumn[] = [
  { id: 'todo', title: 'TODO', status: TaskStatus.TODO, tasks: [] },
  { id: 'in-progress', title: 'IN PROGRESS', status: TaskStatus.IN_PROGRESS, tasks: [] },
  { id: 'done', title: 'DONE', status: TaskStatus.DONE, tasks: [] },
];

export const kanbanStore = create<KanbanStore>((set) => ({
  tasks: [],
  columns: initialColumns,
  filter: '',
  setFilter: (query: string) => set({ filter: query }),
}));

// Hook to integrate use-tasks and use-filter with Zustand
export const useKanbanStore = () => {
  const tasksData = useTasks();
  const filterData = useFilter();
  
  return {
    ...tasksData,
    ...filterData,
    // Zustand-like interface
    tasks: tasksData.tasks,
    columns: tasksData.columns,
    filter: kanbanStore.getState().filter,
    setFilter: (query: string) => {
      kanbanStore.setState({ filter: query });
      filterData.setFilter(query);
    },
  };
};
