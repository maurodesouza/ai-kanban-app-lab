'use client';

import { useEffect } from 'react';

import { events } from '@/events';
import { Events } from '@/types/events';
import type { AddTaskEventPayload, EditTaskEventPayload, DeleteTaskEventPayload } from '@/events/handles/kanban';
import { kanbanStores } from '@/stores/kanban';

function KanbanHandler() {
  // Event handlers for kanban events
  function handleTaskAdd(args: AddTaskEventPayload) {
    console.log('Kanban task add event received:', args);
    
    // Find the kanban store by id
    const kanbanStore = kanbanStores.get(args.id);
    if (!kanbanStore) {
      console.error(`Kanban store with id ${args.id} not found`);
      return;
    }

    // Add the new task to the store
    kanbanStore.tasks[args.data.id] = args.data;
    
    // If the task has a columnId, add it to that column
    if (args.data.columnId) {
      if (!kanbanStore.columns[args.data.columnId]) {
        console.error(`Column ${args.data.columnId} not found in kanban store`);
        return;
      }
      
      // Add task to column if not already there
      if (!kanbanStore.columns[args.data.columnId].tasksId.includes(args.data.id)) {
        kanbanStore.columns[args.data.columnId].tasksId.push(args.data.id);
      }
    }
  }

  function handleTaskEdit(args: EditTaskEventPayload) {
    console.log('Kanban task edit event received:', args);
    
    // Find the kanban store by id
    const kanbanStore = kanbanStores.get(args.id);
    if (!kanbanStore) {
      console.error(`Kanban store with id ${args.id} not found`);
      return;
    }

    // Get the existing task
    const existingTask = kanbanStore.tasks[args.data.id];
    if (!existingTask) {
      console.error(`Task ${args.data.id} not found in kanban store`);
      return;
    }

    // Update the task
    kanbanStore.tasks[args.data.id] = { ...existingTask, ...args.data };

    // Handle column change if needed
    if (args.data.columnId && args.data.columnId !== existingTask.columnId) {
      // Remove from old column
      if (existingTask.columnId && kanbanStore.columns[existingTask.columnId]) {
        const oldColumnTasks = kanbanStore.columns[existingTask.columnId].tasksId;
        const taskIndex = oldColumnTasks.indexOf(args.data.id);
        if (taskIndex > -1) {
          oldColumnTasks.splice(taskIndex, 1);
        }
      }

      // Add to new column
      if (kanbanStore.columns[args.data.columnId]) {
        const newColumnTasks = kanbanStore.columns[args.data.columnId].tasksId;
        if (!newColumnTasks.includes(args.data.id)) {
          newColumnTasks.push(args.data.id);
        }
      }
    }
  }

  function handleTaskDelete(args: DeleteTaskEventPayload) {
    console.log('Kanban task delete event received:', args);
    
    // Find the kanban store by id
    const kanbanStore = kanbanStores.get(args.id);
    if (!kanbanStore) {
      console.error(`Kanban store with id ${args.id} not found`);
      return;
    }

    // Get the task to be deleted
    const taskToDelete = kanbanStore.tasks[args.data];
    if (!taskToDelete) {
      console.error(`Task ${args.data} not found in kanban store`);
      return;
    }

    // Remove task from its column
    if (taskToDelete.columnId && kanbanStore.columns[taskToDelete.columnId]) {
      const columnTasks = kanbanStore.columns[taskToDelete.columnId].tasksId;
      const taskIndex = columnTasks.indexOf(args.data);
      if (taskIndex > -1) {
        columnTasks.splice(taskIndex, 1);
      }
    }

    // Remove task from store
    delete kanbanStore.tasks[args.data];
  }

  useEffect(() => {
    events.on(Events.KANBAN_TASK_ADD, handleTaskAdd);
    events.on(Events.KANBAN_TASK_EDIT, handleTaskEdit);
    events.on(Events.KANBAN_TASK_DELETE, handleTaskDelete);
    
    return () => {
      events.off(Events.KANBAN_TASK_ADD, handleTaskAdd);
      events.off(Events.KANBAN_TASK_EDIT, handleTaskEdit);
      events.off(Events.KANBAN_TASK_DELETE, handleTaskDelete);
    };
  }, []);

  return null; // Handler components are typically invisible
}

export { KanbanHandler };
