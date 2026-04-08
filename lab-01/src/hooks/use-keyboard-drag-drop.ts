import { useEffect, useState, useCallback } from 'react';
import { Task } from '@/types/task';
import { events } from '@/events';

interface KeyboardDragState {
  selectedTaskId: string | null;
  targetColumn: string | null;
  isActive: boolean;
}

export function useKeyboardDragDrop() {
  const [state, setState] = useState<KeyboardDragState>({
    selectedTaskId: null,
    targetColumn: null,
    isActive: false,
  });

  const startKeyboardDrag = useCallback((taskId: string) => {
    setState({
      selectedTaskId: taskId,
      targetColumn: null,
      isActive: true,
    });

    // Announce to screen readers
    const announcements = document.getElementById('drag-announcements');
    if (announcements) {
      announcements.textContent = `Keyboard drag activated. Use arrow keys to select column, Enter to move, Escape to cancel.`;
    }
  }, []);

  const cancelKeyboardDrag = useCallback(() => {
    setState({
      selectedTaskId: null,
      targetColumn: null,
      isActive: false,
    });

    // Announce to screen readers
    const announcements = document.getElementById('drag-announcements');
    if (announcements) {
      announcements.textContent = 'Keyboard drag cancelled.';
    }
  }, []);

  const moveTask = useCallback((taskId: string, targetStatus: string) => {
    // Find the task to get its current status
    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    const sourceStatus = taskElement?.getAttribute('data-task-status');
    
    if (!sourceStatus || sourceStatus === targetStatus) {
      cancelKeyboardDrag();
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
      const announcements = document.getElementById('drag-announcements');
      if (announcements) {
        const statusNames = {
          'todo': 'TODO',
          'in_progress': 'IN PROGRESS',
          'done': 'DONE'
        };
        const sourceName = statusNames[sourceStatus as keyof typeof statusNames];
        const targetName = statusNames[targetStatus as keyof typeof statusNames];
        announcements.textContent = `Task moved from ${sourceName} to ${targetName}`;
      }
    } catch (error) {
      console.error('Error during keyboard drag drop:', error);
      const announcements = document.getElementById('drag-announcements');
      if (announcements) {
        announcements.textContent = 'Error moving task';
      }
    }

    cancelKeyboardDrag();
  }, [cancelKeyboardDrag]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!state.isActive) return;

    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        cancelKeyboardDrag();
        break;

      case 'Enter':
        event.preventDefault();
        if (state.selectedTaskId && state.targetColumn) {
          moveTask(state.selectedTaskId, state.targetColumn);
        }
        break;

      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault();
        if (!state.selectedTaskId) return;

        const columns = ['todo', 'in_progress', 'done'];
        const currentColumnIndex = state.targetColumn ? columns.indexOf(state.targetColumn) : -1;
        
        let newColumnIndex;
        if (event.key === 'ArrowLeft') {
          newColumnIndex = currentColumnIndex > 0 ? currentColumnIndex - 1 : columns.length - 1;
        } else {
          newColumnIndex = currentColumnIndex < columns.length - 1 ? currentColumnIndex + 1 : 0;
        }

        const newTargetColumn = columns[newColumnIndex];
        setState(prev => ({ ...prev, targetColumn: newTargetColumn }));

        // Announce column selection
        const announcements = document.getElementById('drag-announcements');
        if (announcements) {
          const statusNames = {
            'todo': 'TODO',
            'in_progress': 'IN PROGRESS',
            'done': 'DONE'
          };
          announcements.textContent = `Target column: ${statusNames[newTargetColumn as keyof typeof statusNames]}`;
        }
        break;

      case 'Tab':
        event.preventDefault();
        // Allow tab navigation through tasks when keyboard drag is active
        const focusableElements = document.querySelectorAll('[data-task-id][tabindex="0"]');
        const taskElementIndex = Array.from(focusableElements).findIndex(el => 
          el === document.activeElement
        );
        
        let nextTaskIndex;
        if (event.shiftKey) {
          nextTaskIndex = taskElementIndex > 0 ? taskElementIndex - 1 : focusableElements.length - 1;
        } else {
          nextTaskIndex = taskElementIndex < focusableElements.length - 1 ? taskElementIndex + 1 : 0;
        }

        const nextElement = focusableElements[nextTaskIndex] as HTMLElement;
        if (nextElement) {
          nextElement.focus();
          const taskId = nextElement.getAttribute('data-task-id');
          if (taskId) {
            setState(prev => ({ ...prev, selectedTaskId: taskId }));
          }
        }
        break;
    }
  }, [state.isActive, state.selectedTaskId, state.targetColumn, cancelKeyboardDrag, moveTask]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    state,
    startKeyboardDrag,
    cancelKeyboardDrag,
  };
}

export const keyboardDragShortcuts = {
  'Enter (when task selected)': 'Move task to selected column',
  'Arrow Left/Right': 'Select target column',
  'Tab/Shift+Tab': 'Navigate between tasks',
};
