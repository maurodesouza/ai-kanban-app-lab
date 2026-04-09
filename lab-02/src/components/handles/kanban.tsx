'use client';

import { useEffect } from 'react';

import { events } from '@/events';
import { Events } from '@/types/events';
import type { AddTaskEventPayload, EditTaskEventPayload, DeleteTaskEventPayload } from '@/events/handles/kanban';

function KanbanHandler() {
  // Event handlers for kanban events
  function handleTaskAdd(args: AddTaskEventPayload) {
    console.log('Kanban task add event received:', args);
    // TODO: Update kanban store with new task
  }

  function handleTaskEdit(args: EditTaskEventPayload) {
    console.log('Kanban task edit event received:', args);
    // TODO: Update kanban store with edited task
  }

  function handleTaskDelete(args: DeleteTaskEventPayload) {
    console.log('Kanban task delete event received:', args);
    // TODO: Update kanban store with deleted task
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
