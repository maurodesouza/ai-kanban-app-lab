'use client';

import React, { createContext, useContext, useEffect } from 'react';
import { useSnapshot } from 'valtio';
import { twx } from '@/utils/tailwind/index';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Field } from '@/components/molecules/field';
import { events } from '@/events';
import { kanbanStore } from '@/stores/kanban';
import { TaskModal } from '@/components/molecules/task-modal';
import type { KanbanStoreState, Column, Task } from '@/types/kanban';

// Context and Provider
const KanbanContext = createContext<KanbanStoreState | null>(null);

type KanbanProviderProps = React.PropsWithChildren<{
  title?: string;
}>;

function KanbanProvider({
  children,
  title = 'AI Todo App',
}: KanbanProviderProps) {
  const [store] = React.useState(() => kanbanStore.create(title));

  useEffect(() => {
    return () => {
      kanbanStore.remove(store.$$storeId);
    };
  }, [store]);

  return (
    <KanbanContext.Provider value={store}>{children}</KanbanContext.Provider>
  );
}

// Hook
function useKanban() {
  const store = useContext(KanbanContext);

  if (!store) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }

  return useSnapshot(store);
}

// Styles with twx for static components
const Container = twx.div`base-1 bg-background-base min-h-screen p-6`;
const Header = twx.div`flex justify-between items-center mb-6`;
const Content = twx.div`flex gap-6 overflow-x-auto`;
const ColumnContainer = twx.div`base-1 bg-background-base border border-ring-inner rounded-lg min-w-80 p-4`;
const ColumnHeader = twx.div`mb-4`;
const ColumnContent = twx.div`space-y-2`;
const TaskContainer = twx.div`base-1 bg-background-base border border-ring-inner rounded-md p-3`;
const TaskHeader = twx.div`mb-2`;
const TaskFooter = twx.div`flex justify-end gap-2`;

// Title component that consumes store
function Title() {
  const snap = useKanban();

  return <Text.Heading hierarchy="h1">{snap.title}</Text.Heading>;
}

// Filter component
function Filter({ children }: React.PropsWithChildren) {
  const snap = useKanban();
  const storeRef = React.useRef(useContext(KanbanContext)!);

  const onChange = React.useCallback((value: string) => {
    events.kanban.filter({
      storeId: storeRef.current.$$storeId,
      filter: value,
    });
  }, []);

  return (
    <Field.Container>
      <Field.Label>Filter</Field.Label>
      <Field.Input
        value={snap.filter}
        onChange={e => onChange(e.target.value)}
        placeholder="Filter tasks..."
      />
      {children}
    </Field.Container>
  );
}

// Columns component
type ColumnsProps = {
  render: (column: Column) => React.ReactNode;
};

function Columns({ render }: ColumnsProps) {
  const snap = useKanban();

  return (
    <>{Object.values(snap.columns).map(column => render(column as Column))}</>
  );
}

// Column Footer component
function ColumnFooter({ children }: React.PropsWithChildren) {
  return <div className="mt-4 pt-4 border-t border-ring-inner">{children}</div>;
}

// Column namespace
const Column = {
  Container: ColumnContainer,
  Header: ColumnHeader,
  Title: ColumnTitle,
  Content: ColumnContent,
  Footer: ColumnFooter,
};

// Column Title component
function ColumnTitle({ children }: React.PropsWithChildren) {
  return <Text.Heading hierarchy="h2">{children}</Text.Heading>;
}

// Tasks component
type TasksProps = {
  columnId: string;
  render: (task: Task) => React.ReactNode;
};

function Tasks({ columnId, render }: TasksProps) {
  const snap = useKanban();
  const columnTasks = snap.$columnsWithTasks[columnId] || {};

  return <>{Object.values(columnTasks).map(task => render(task))}</>;
}

// AddTaskAction component
type AddTaskActionProps = React.PropsWithChildren<{
  columnId: string;
}>;

function AddTaskAction({ columnId, children }: AddTaskActionProps) {
  const store = useContext(KanbanContext)!;

  function onClick() {
    events.modal.show(() => (
      <TaskModal storeId={store.$$storeId} columnId={columnId} />
    ));
  }

  return (
    <Clickable.Button tone="brand" onClick={onClick}>
      {children || 'Add Task'}
    </Clickable.Button>
  );
}

// Task namespace
const Task = {
  Container: TaskContainer,
  Header: TaskHeader,
  Title: TaskTitle,
  Footer: TaskFooter,
  DeleteAction,
  EditAction,
  Tasks,
  AddTaskAction,
};

// Task Title component
function TaskTitle({ children }: React.PropsWithChildren) {
  return <Text.Paragraph>{children}</Text.Paragraph>;
}

// Task DeleteAction component
type DeleteActionProps = React.PropsWithChildren<{
  taskId: string;
}>;

function DeleteAction({ taskId, children }: DeleteActionProps) {
  const store = useContext(KanbanContext)!;

  function onClick() {
    events.kanban.deleteTask({
      storeId: store.$$storeId,
      taskId,
    });
  }

  return (
    <Clickable.Button tone="danger" onClick={onClick}>
      {children || 'Delete'}
    </Clickable.Button>
  );
}

// Task EditAction component
type EditActionProps = React.PropsWithChildren<{
  taskId: string;
}>;

function EditAction({ taskId, children }: EditActionProps) {
  const store = useContext(KanbanContext)!;
  const snap = useSnapshot(store);

  function onClick() {
    const task = snap.tasks[taskId];
    if (!task) return;

    events.modal.show(() => (
      <TaskModal storeId={store.$$storeId} task={task} />
    ));
  }

  return (
    <Clickable.Button tone="brand" onClick={onClick}>
      {children || 'Edit'}
    </Clickable.Button>
  );
}

// Global AddTaskAction component
type GlobalAddTaskActionProps = React.PropsWithChildren;

function GlobalAddTaskAction({ children }: GlobalAddTaskActionProps) {
  const store = useContext(KanbanContext)!;

  function onClick() {
    events.modal.show(() => <TaskModal storeId={store.$$storeId} />);
  }

  return (
    <Clickable.Button tone="success" onClick={onClick}>
      {children || 'Add Task'}
    </Clickable.Button>
  );
}

// Export composition
export const Kanban = {
  Provider: KanbanProvider,
  Container,
  Header,
  Title,
  Filter,
  AddTaskAction: GlobalAddTaskAction,
  Content,
  Columns,
  Column,
  Task,
};
