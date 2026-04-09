'use client';

import { useEffect } from 'react';

import { events } from '@/events';
import { Events } from '@/types/events';
import type { AddTaskEventPayload, EditTaskEventPayload, DeleteTaskEventPayload, FilterEventPayload } from '@/events/handles/kanban';
import { kanbanStores } from '@/stores/kanban';

function KanbanHandler() {
  // Event handlers for kanban events
  function handleTaskAdd(payload: AddTaskEventPayload) {
    console.log('Kanban task add event received:', payload);
    
    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Add the new task to the store
    kanbanStore.tasks[payload.data.id] = payload.data;
    
    // If the task has a columnId, add it to that column
    if (payload.data.columnId) {
      if (!kanbanStore.columns[payload.data.columnId]) {
        console.error(`Column ${payload.data.columnId} not found in kanban store`);
        return;
      }
      
      // Add task to column if not already there
      if (!kanbanStore.columns[payload.data.columnId].tasksId.includes(payload.data.id)) {
        kanbanStore.columns[payload.data.columnId].tasksId.push(payload.data.id);
      }
    }
  }

  function handleTaskEdit(payload: EditTaskEventPayload) {
    console.log('Kanban task edit event received:', payload);
    
    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Get the existing task
    const existingTask = kanbanStore.tasks[payload.data.id];
    if (!existingTask) {
      console.error(`Task ${payload.data.id} not found in kanban store`);
      return;
    }

    // Update the task
    kanbanStore.tasks[payload.data.id] = { ...existingTask, ...payload.data };

    // Handle column change if needed
    if (payload.data.columnId && payload.data.columnId !== existingTask.columnId) {
      // Remove from old column
      if (existingTask.columnId && kanbanStore.columns[existingTask.columnId]) {
        const oldColumnTasks = kanbanStore.columns[existingTask.columnId].tasksId;
        const taskIndex = oldColumnTasks.indexOf(payload.data.id);
        if (taskIndex > -1) {
          oldColumnTasks.splice(taskIndex, 1);
        }
      }

      // Add to new column
      if (kanbanStore.columns[payload.data.columnId]) {
        const newColumnTasks = kanbanStore.columns[payload.data.columnId].tasksId;
        if (!newColumnTasks.includes(payload.data.id)) {
          newColumnTasks.push(payload.data.id);
        }
      }
    }
  }

  function handleTaskDelete(payload: DeleteTaskEventPayload) {
    console.log('Kanban task delete event received:', payload);
    
    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Get the task to be deleted
    const taskToDelete = kanbanStore.tasks[payload.data];
    if (!taskToDelete) {
      console.error(`Task ${payload.data} not found in kanban store`);
      return;
    }

    // Remove task from its column
    if (taskToDelete.columnId && kanbanStore.columns[taskToDelete.columnId]) {
      const columnTasks = kanbanStore.columns[taskToDelete.columnId].tasksId;
      const taskIndex = columnTasks.indexOf(payload.data);
      if (taskIndex > -1) {
        columnTasks.splice(taskIndex, 1);
      }
    }

    // Remove task from store
    delete kanbanStore.tasks[payload.data];
  }

  function handleFilter(payload: FilterEventPayload) {
    console.log('Kanban filter event received:', payload);
    
    // Find the kanban store by storeId
    const kanbanStore = kanbanStores.get(payload.storeId);
    if (!kanbanStore) {
      console.error(`Kanban store with storeId ${payload.storeId} not found`);
      return;
    }

    // Update filter in store
    kanbanStore.filter = payload.filter;
  }

  useEffect(() => {
    events.on(Events.KANBAN_TASK_ADD, handleTaskAdd);
    events.on(Events.KANBAN_TASK_EDIT, handleTaskEdit);
    events.on(Events.KANBAN_TASK_DELETE, handleTaskDelete);
    events.on(Events.KANBAN_FILTER, handleFilter);
    
    return () => {
      events.off(Events.KANBAN_TASK_ADD, handleTaskAdd);
      events.off(Events.KANBAN_TASK_EDIT, handleTaskEdit);
      events.off(Events.KANBAN_TASK_DELETE, handleTaskDelete);
      events.off(Events.KANBAN_FILTER, handleFilter);
    };
  }, []);

  return null; // Handler components are typically invisible
}

export { KanbanHandler };
