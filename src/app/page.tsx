'use client';

import { PlusIcon } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Kanban } from '@/components/organisms/kanban';
import { TaskModal } from '@/components/organisms/Task/TaskModal';
import { TaskCard } from '@/components/molecules/Task/TaskCard';
import { useState } from 'react';
import { useKanbanStore } from '@/stores/kanban';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export default function Home() {
  const [activeTask, setActiveTask] = useState<any>(null);
  const { isLoading, error } = useKanbanStore();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    // Find the task data from the active draggable
    const taskId = active.id as string;
    // You might need to get the task data from your store or context
    // For now, we'll just store the id
    setActiveTask({ id: taskId });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      // Announce drag cancelled
      const dragAnnouncements = document.getElementById('drag-announcements');
      if (dragAnnouncements) {
        dragAnnouncements.textContent = 'Drag cancelled';
      }
      return;
    }
    
    const taskId = active.id as string;
    const targetStatus = over.id as string;
    
    // Get the source status from the draggable data
    const sourceStatus = (active.data.current as any)?.sourceStatus;
    
    // Handle edge cases
    if (!sourceStatus) {
      console.warn('No source status found for task:', taskId);
      setActiveTask(null);
      return;
    }
    
    // Prevent dropping to same column
    if (sourceStatus === targetStatus) {
      setActiveTask(null);
      // Announce same column drop
      const dragAnnouncements = document.getElementById('drag-announcements');
      if (dragAnnouncements) {
        dragAnnouncements.textContent = 'Task moved to same column';
      }
      return;
    }
    
    // Validate target status
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(targetStatus)) {
      console.warn('Invalid target status:', targetStatus);
      setActiveTask(null);
      return;
    }
    
    try {
      events.drag.end({
        taskId,
        sourceStatus,
        targetStatus,
      });
      
      events.drag.drop({
        taskId,
        sourceStatus,
        targetStatus,
      });

      // Announce successful move
      const dragAnnouncements = document.getElementById('drag-announcements');
      if (dragAnnouncements) {
        const statusNames = {
          'todo': 'TODO',
          'in_progress': 'IN PROGRESS', 
          'done': 'DONE'
        };
        const sourceName = statusNames[sourceStatus as keyof typeof statusNames];
        const targetName = statusNames[targetStatus as keyof typeof statusNames];
        dragAnnouncements.textContent = `Task moved from ${sourceName} to ${targetName}`;
      }
    } catch (error) {
      console.error('Error during drag drop:', error);
      // Announce error
      const dragAnnouncements = document.getElementById('drag-announcements');
      if (dragAnnouncements) {
        dragAnnouncements.textContent = 'Error moving task';
      }
    }
    
    setActiveTask(null);
  };

  return (
    <div className="min-h-screen bg-background-base">
      {/* Accessibility live regions */}
      <div 
        id="filter-announcements" 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      />
      <div 
        id="drag-announcements" 
        className="sr-only" 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
      />

      {/* Global loading indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50 bg-tone-primary-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span className="text-sm">Loading...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-palette-danger text-white px-3 py-2 rounded-lg shadow-lg max-w-sm">
          <p className="text-sm">{error}</p>
        </div>
      )}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Kanban.Root>
          <Kanban.Header>
            <Text.Heading as="h1" className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
              Kanban Board
            </Text.Heading>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Kanban.Filter />
              <Clickable.Button 
                onClick={() => events.modal.open({ modal: ModalsEnum.TASK })}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-sm sm:text-base"
                aria-label="Adicionar nova tarefa (Ctrl+N)"
                title="New task (Ctrl+N)"
                disabled={isLoading}
              >
                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                <span className="hidden sm:inline">Adicionar Task</span>
                <span className="sm:hidden">Adicionar</span>
              </Clickable.Button>
            </div>
          </Kanban.Header>
          <Kanban.Columns render={({ column }) => <Kanban.Column column={column} />} />
        </Kanban.Root>
        <TaskModal.Component />
        <DragOverlay>
          {activeTask && (
            <div className="transform rotate-3 shadow-2xl opacity-90">
              <TaskCard.Root task={activeTask} />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
