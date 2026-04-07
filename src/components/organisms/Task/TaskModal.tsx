import React from 'react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { TaskForm } from '@/components/molecules/Form/TaskForm';

function Root({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      // Store previous focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element after modal opens
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Keyboard navigation
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
      
      // Trap focus within modal
      if (event.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as NodeListOf<HTMLElement>;
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div 
        ref={modalRef}
        className="bg-background-support rounded-lg border border-tone-contrast-300 w-full max-w-md p-6 outline-none"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between mb-6">
      {children}
    </header>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <Text.Heading as="h2" id="modal-title" className="text-lg font-semibold text-foreground">
      {children}
    </Text.Heading>
  );
}

function Close({ onClose }: { onClose: () => void }) {
  return (
    <Clickable.Button
      onClick={onClose}
      aria-label="Fechar modal"
      className="p-2 hover:bg-tone-contrast-100 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring-outer focus:ring-offset-2"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </Clickable.Button>
  );
}

function Content({ children }: { children: React.ReactNode }) {
  return <div className="mb-6">{children}</div>;
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-3">
      {children}
    </div>
  );
}

function TaskModalComponent() {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const handleModalOpen = (event: CustomEvent) => {
      if (event.detail.modal === ModalsEnum.TASK) {
        setIsOpen(true);
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }
    };

    const handleModalClose = () => {
      setIsOpen(false);
      // Restore body scroll
      document.body.style.overflow = '';
    };

    document.addEventListener('modal.open', handleModalOpen as EventListener);
    document.addEventListener('modal.close', handleModalClose);

    return () => {
      document.removeEventListener('modal.open', handleModalOpen as EventListener);
      document.removeEventListener('modal.close', handleModalClose);
      // Clean up body scroll on unmount
      document.body.style.overflow = '';
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    events.modal.close();
  };

  return (
    <Root isOpen={isOpen} onClose={handleClose}>
      <Header>
        <Title>Nova Tarefa</Title>
        <Close onClose={handleClose} />
      </Header>
      <Content>
        <TaskForm.Component />
      </Content>
    </Root>
  );
}

export const TaskModal = {
  Root,
  Header,
  Title,
  Close,
  Content,
  Footer,
  Component: TaskModalComponent,
};
