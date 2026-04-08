'use client';

import { PlusIcon } from 'lucide-react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import dynamic from 'next/dynamic';
import { Suspense, useState } from 'react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Kanban } from '@/components/organisms/kanban';
import { ThemeToggle } from '@/components/atoms/ThemeToggle';
import { useKanbanStore } from '@/stores/kanban';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useKeyboardDragDrop } from '@/hooks/use-keyboard-drag-drop';
import { usePerformanceMonitoring } from '@/hooks/use-performance-monitoring';
import { useTheme } from '@/hooks/use-theme';

// Dynamic imports for code splitting
const TaskModal = dynamic(
  () => import('@/components/organisms/Task/TaskModal').then(mod => ({ default: mod.TaskModal.Component })),
  { 
    loading: () => <div className="animate-pulse bg-surface-200 rounded-lg h-64" />,
    ssr: false 
  }
);

const TaskCard = dynamic(
  () => import('@/components/molecules/Task/TaskCard').then(mod => ({ default: mod.TaskCard.Root })),
  { 
    loading: () => <div className="animate-pulse bg-surface-200 rounded-lg h-24" />,
    ssr: false 
  }
);

// Development-only components with dynamic imports
const DevelopmentTools = process.env.NODE_ENV === 'development' ? dynamic(
  () => import('@/app/DevelopmentTools').then(mod => ({ default: mod.DevelopmentTools })),
  { ssr: false }
) : () => null;

export default function Home() {
  const [activeTask, setActiveTask] = useState<any>(null);
  const { isLoading, error, tasks, updateTask } = useKanbanStore();
  
  // Enable keyboard shortcuts and drag drop
  useKeyboardShortcuts();
  useKeyboardDragDrop();
  
  // Performance monitoring
  const { measureOperation } = usePerformanceMonitoring();
  
  // Theme initialization
  useTheme();

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
    
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // Get the source status from the draggable data
    const sourceStatus = (active.data.current as any)?.sourceStatus;
    
    // Handle edge cases
    if (!sourceStatus) {
      console.warn('No source status found for task:', activeId);
      setActiveTask(null);
      return;
    }
    
    // Check if this is a reorder within the same column
    if (sourceStatus === overId) {
      // This is a reorder operation within the same column
      const columnTasks = tasks.filter((task: any) => task.status === sourceStatus);
      const oldIndex = columnTasks.findIndex((task: any) => task.id === activeId);
      const newIndex = columnTasks.findIndex((task: any) => task.id === overId);
      
      if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
        // Reorder the tasks
        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
        
        // Update the order property for each task
        reorderedTasks.forEach((task: any, index: number) => {
          updateTask(task.id, { order: index + 1 });
        });
        
        // Announce reorder
        const dragAnnouncements = document.getElementById('drag-announcements');
        if (dragAnnouncements) {
          dragAnnouncements.textContent = `Task reordered to position ${newIndex + 1}`;
        }
      }
      
      setActiveTask(null);
      return;
    }
    
    // This is a move to different column
    const validStatuses = ['todo', 'in_progress', 'done'];
    if (!validStatuses.includes(overId)) {
      console.warn('Invalid target status:', overId);
      setActiveTask(null);
      return;
    }
    
    try {
      events.drag.end({
        taskId: activeId,
        sourceStatus,
        targetStatus: overId,
      });
      
      events.drag.drop({
        taskId: activeId,
        sourceStatus,
        targetStatus: overId,
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
        const targetName = statusNames[overId as keyof typeof statusNames];
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
    <div className="min-h-screen bg-gradient-to-br from-background-base via-background-base to-background-support">
      {/* Background decoration */}
      <div className="fixed inset-0 bg-gradient-to-tr from-tone-primary-50/5 via-transparent to-tone-secondary-50/5 pointer-events-none" />
      
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
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-tone-primary-500 to-tone-primary-600 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 backdrop-blur-sm">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          <span className="text-sm font-medium">Loading...</span>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-palette-danger to-palette-danger/90 text-white px-4 py-2 rounded-xl shadow-xl max-w-sm backdrop-blur-sm">
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Kanban.Root>
          <Kanban.Header>
            <Text.Heading as="h1" className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground bg-gradient-to-r from-tone-primary-600 to-tone-secondary-600 bg-clip-text text-transparent">
              Kanban Board
            </Text.Heading>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              <Kanban.Filter />
              <ThemeToggle />
              <Clickable.Button 
                onClick={() => events.modal.open({ modal: ModalsEnum.TASK })}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-4 sm:px-6 text-sm sm:text-base bg-gradient-to-r from-tone-primary-500 to-tone-primary-600 hover:from-tone-primary-600 hover:to-tone-primary-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
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
        <Suspense fallback={<div className="animate-pulse bg-surface-200 rounded-lg h-64" />}>
          <TaskModal />
        </Suspense>
        <DragOverlay>
          {activeTask && (
            <div className="transform rotate-3 shadow-2xl opacity-90 rounded-lg">
              <Suspense fallback={<div className="animate-pulse bg-surface-200 rounded-lg h-24" />}>
                <TaskCard task={activeTask} />
              </Suspense>
            </div>
          )}
        </DragOverlay>
      </DndContext>
      
      {/* Development Tools */}
      <Suspense fallback={null}>
        <DevelopmentTools />
      </Suspense>
    </div>
  );
}
