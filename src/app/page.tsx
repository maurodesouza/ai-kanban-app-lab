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

export default function Home() {
  const [activeTask, setActiveTask] = useState<any>(null);

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
    } catch (error) {
      console.error('Error during drag drop:', error);
    }
    
    setActiveTask(null);
  };

  return (
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
              aria-label="Adicionar nova tarefa"
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
  );
}
