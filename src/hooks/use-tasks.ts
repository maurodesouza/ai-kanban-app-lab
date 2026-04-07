import React, { useEffect, useCallback } from 'react';
import { Task, TaskStatus, KanbanColumn } from '@/types/task';
import { TaskHandleEvents, type TaskCreateEvent } from '@/events/handles/task';

// Initial columns setup
const initialColumns: KanbanColumn[] = [
  { id: 'todo', title: 'TODO', status: TaskStatus.TODO, tasks: [] },
  { id: 'in-progress', title: 'IN PROGRESS', status: TaskStatus.IN_PROGRESS, tasks: [] },
  { id: 'done', title: 'DONE', status: TaskStatus.DONE, tasks: [] },
];

// Generate unique ID
const generateId = () => Date.now().toString();

// Create task object from form data
const createTaskFromData = (data: TaskCreateEvent): Task => ({
  id: generateId(),
  title: data.title,
  description: data.description,
  dueDate: data.dueDate,
  status: data.status,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 1, // Will be calculated based on existing tasks
});

// Calculate task order based on existing tasks
const calculateTaskOrder = (tasks: Task[]): number => {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(task => task.order)) + 1;
};

export const useTasks = () => {
  // State management - in a real app, this would be persisted
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [columns, setColumns] = React.useState<KanbanColumn[]>(initialColumns);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Add task to the appropriate column
  const addTask = useCallback((taskData: TaskCreateEvent) => {
    setIsLoading(true);
    setError(null);

    try {
      const newTask = createTaskFromData(taskData);
      
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, newTask];
        
        // Update columns with the new task
        setColumns(prevColumns => 
          prevColumns.map(column => 
            column.status === newTask.status
              ? { ...column, tasks: [...column.tasks, newTask] }
              : column
          )
        );
        
        return updatedTasks;
      });

      console.log('Task created successfully:', newTask);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      console.error('Error creating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update task
  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setIsLoading(true);
    setError(null);

    try {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task =>
          task.id === taskId
            ? { ...task, ...updates, updatedAt: new Date().toISOString() }
            : task
        );

        // Update columns with the updated task
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            tasks: updatedTasks.filter(task => task.status === column.status)
          }))
        );

        return updatedTasks;
      });

      console.log('Task updated successfully:', taskId, updates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      console.error('Error updating task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback((taskId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.filter(task => task.id !== taskId);

        // Update columns without the deleted task
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            tasks: updatedTasks.filter(task => task.status === column.status)
          }))
        );

        return updatedTasks;
      });

      console.log('Task deleted successfully:', taskId);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      console.error('Error deleting task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Move task between columns (drag and drop)
  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      setTasks(prevTasks => {
        const taskToMove = prevTasks.find(task => task.id === taskId);
        if (!taskToMove) {
          throw new Error('Task not found');
        }

        const oldStatus = taskToMove.status;
        
        if (oldStatus === newStatus) {
          return prevTasks; // No change needed
        }

        const updatedTasks = prevTasks.map(task =>
          task.id === taskId
            ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
            : task
        );

        // Update columns with the moved task
        setColumns(prevColumns => 
          prevColumns.map(column => ({
            ...column,
            tasks: updatedTasks.filter(task => task.status === column.status)
          }))
        );

        // Emit move event for drag and drop
        TaskHandleEvents.move({
          id: taskId,
          newStatus,
          oldStatus,
        });

        return updatedTasks;
      });

      console.log('Task moved successfully:', taskId, newStatus);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to move task';
      setError(errorMessage);
      console.error('Error moving task:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Setup event listeners
  useEffect(() => {
    // Listen for task creation events
    const handleTaskCreate = (event: CustomEvent<TaskCreateEvent>) => {
      addTask(event.detail);
    };

    // Listen for task update events
    const handleTaskUpdate = (event: CustomEvent<{ id: string; updates: Partial<Task> }>) => {
      updateTask(event.detail.id, event.detail.updates);
    };

    // Listen for task delete events
    const handleTaskDelete = (event: CustomEvent<{ id: string }>) => {
      deleteTask(event.detail.id);
    };

    // Register event listeners
    document.addEventListener('task.create', handleTaskCreate as EventListener);
    document.addEventListener('task.update', handleTaskUpdate as EventListener);
    document.addEventListener('task.delete', handleTaskDelete as EventListener);

    // Cleanup
    return () => {
      document.removeEventListener('task.create', handleTaskCreate as EventListener);
      document.removeEventListener('task.update', handleTaskUpdate as EventListener);
      document.removeEventListener('task.delete', handleTaskDelete as EventListener);
    };
  }, [addTask, updateTask, deleteTask]);

  return {
    tasks,
    columns,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    // Computed values
    tasksByStatus: (status: TaskStatus) => tasks.filter(task => task.status === status),
    columnByStatus: (status: TaskStatus) => columns.find(col => col.status === status),
    totalTasks: tasks.length,
    tasksCountByStatus: (status: TaskStatus) => tasks.filter(task => task.status === status).length,
  };
};
