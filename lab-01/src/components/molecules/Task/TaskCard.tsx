import React from 'react';
import { Text } from '@/components/atoms/text';
import { Task } from '@/types/task';
import { useSortable } from '@dnd-kit/sortable';
import { useDragHandle } from '@/components/handles/dragHandles';
import { useKeyboardDragDrop } from '@/hooks/use-keyboard-drag-drop';

interface TaskCardProps {
  task: Task;
  className?: string;
}

function Root({ task, className }: TaskCardProps) {
  const { state, startKeyboardDrag } = useKeyboardDragDrop();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      taskId: task.id,
      sourceStatus: task.status,
    }
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Space or Enter to start keyboard drag
    if ((event.key === ' ' || event.key === 'Enter') && !state.isActive) {
      event.preventDefault();
      startKeyboardDrag(task.id);
    }
  };

  const isSelected = state.selectedTaskId === task.id;
  const isTargetColumn = state.targetColumn === task.status;

  return (
    <article 
      ref={setNodeRef}
      style={style}
      className={`bg-background-base rounded p-3 sm:p-4 border border-tone-contrast-200 hover:border-tone-contrast-300 hover:shadow-md transition-all duration-200 min-h-[44px] sm:min-h-[48px] focus-within:ring-2 focus-within:ring-ring-outer focus-within:ring-offset-2 cursor-move hover:scale-[1.02] active:scale-[0.98] ${isDragging ? 'shadow-xl rotate-2 scale-105' : ''} ${isSelected ? 'ring-2 ring-ring-outer ring-offset-2' : ''} ${isTargetColumn && state.isActive ? 'ring-2 ring-tone-primary-500 ring-offset-2' : ''} ${className || ''}`}
      aria-label={`Task: ${task.title}`}
      data-task-id={task.id}
      data-task-status={task.status}
      onKeyDown={handleKeyDown}
      {...attributes}
      {...listeners}
    >
      <div className="space-y-2">
        <Title task={task} />
        {task.description && <Description task={task} />}
        {task.dueDate && <DueDate dueDate={task.dueDate} />}
      </div>
      {isSelected && (
        <div className="absolute top-0 right-0 bg-tone-primary-500 text-white text-xs px-2 py-1 rounded-bl-md">
          Keyboard Drag Active
        </div>
      )}
    </article>
  );
}

function Title({ task }: { task: Task }) {
  return (
    <div className="font-medium text-foreground text-sm sm:text-base">
      {task.title}
    </div>
  );
}

function Description({ task }: { task: Task }) {
  return (
    <div className="text-xs sm:text-sm text-foreground-min mt-1 sm:mt-2 line-clamp-2">
      {task.description}
    </div>
  );
}

function DueDate({ dueDate }: { dueDate: string }) {
  const date = new Date(dueDate);
  const formattedDate = date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const isOverdue = date < new Date() && date.toDateString() !== new Date().toDateString();

  return (
    <div className="flex items-center gap-1 text-xs text-foreground-min mt-2">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span className={isOverdue ? 'text-palette-danger' : ''}>
        {formattedDate}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo':
        return 'TODO';
      case 'in_progress':
        return 'IN PROGRESS';
      case 'done':
        return 'DONE';
      default:
        return status.toUpperCase();
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {getStatusLabel(status)}
    </span>
  );
}

export const TaskCard = {
  Root,
  Title,
  Description,
  DueDate,
  StatusBadge,
};
