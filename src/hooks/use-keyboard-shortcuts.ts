import { useEffect, useCallback } from 'react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { keyboardDragShortcuts } from './use-keyboard-drag-drop';

export function useKeyboardShortcuts() {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignore if user is typing in an input
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Ctrl/Cmd + N: New task
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
      event.preventDefault();
      events.modal.open({ modal: ModalsEnum.TASK });
      return;
    }

    // Ctrl/Cmd + K: Focus filter
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const filterInput = document.getElementById('task-filter') as HTMLInputElement;
      if (filterInput) {
        filterInput.focus();
      }
      return;
    }

    // Escape: Close modal
    if (event.key === 'Escape') {
      events.modal.close();
      return;
    }

    // Ctrl/Cmd + /: Show keyboard shortcuts help
    if ((event.ctrlKey || event.metaKey) && event.key === '/') {
      event.preventDefault();
      // TODO: Show keyboard shortcuts modal
      console.log('Keyboard shortcuts help (TODO: implement modal)');
      return;
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}

export const keyboardShortcuts = {
  'Ctrl/Cmd + N': 'New task',
  'Ctrl/Cmd + K': 'Focus filter',
  'Escape': 'Close modal',
  'Ctrl/Cmd + /': 'Show shortcuts',
  ...keyboardDragShortcuts,
};
