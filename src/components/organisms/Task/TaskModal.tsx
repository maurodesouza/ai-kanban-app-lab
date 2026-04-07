import React from 'react';
import { events } from '@/events';
import { ModalsEnum } from '@/types/events';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { TaskForm } from '@/components/molecules/Form/TaskForm';

function Root({ children, isOpen, onClose }: { children: React.ReactNode; isOpen: boolean; onClose: () => void }) {
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
        className="bg-background-support rounded-lg border border-tone-contrast-300 w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-6">
      {children}
    </div>
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
      className="p-2 hover:bg-tone-contrast-100 rounded-md transition-colors"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      }
    };

    const handleModalClose = () => {
      setIsOpen(false);
    };

    document.addEventListener('modal.open', handleModalOpen as EventListener);
    document.addEventListener('modal.close', handleModalClose);

    return () => {
      document.removeEventListener('modal.open', handleModalOpen as EventListener);
      document.removeEventListener('modal.close', handleModalClose);
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
