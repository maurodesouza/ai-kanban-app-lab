'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useSnapshot } from 'valtio';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { twx } from '@/utils/tailwind/index';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Field } from '@/components/molecules/field';
import { events } from '@/events';
import { kanbanStore } from '@/stores/kanban';
import { TaskModal } from '@/components/molecules/task-modal';
import { debounce } from '@/utils/debounce';
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
const Container = twx.div`base-1 flex flex-col gap-lg bg-background-base h-full`;
const Header = twx.div`flex gap-md items-end`;
const Content = twx.div`flex gap-md h-full overflow-x-auto`;

const ColumnContainer = twx.div`base-1 flex flex-col bg-background-base border border-ring-inner rounded-md min-w-60`;
const ColumnHeader = twx.div`flex flex-col min-h-0 border-b border-ring-inner p-md`;
const ColumnContent = twx.div`h-full flex flex-col gap-xs p-md`;
const ColumnFooter = twx.div`flex flex-row-reverse border-t border-ring-inner p-md`;

const TaskContainer = twx.div`base-1 bg-background-base border border-ring-inner rounded-md`;
const TaskHeader = twx.div`p-xs`;
const TaskFooter = twx.div`flex justify-end gap-xs p-xs border-t border-ring-inner`;

// Title component that consumes store
function Title() {
  const snap = useKanban();

  return (
    <Text.Heading as="h2" className="self-center shrink-0">
      {snap.title}
    </Text.Heading>
  );
}

// Filter component
function Filter({ children }: React.PropsWithChildren) {
  const snap = useKanban();
  const store = useContext(KanbanContext)!;

  const debouncedFilter = useMemo(
    () =>
      debounce((value: string) => {
        events.kanban.filter({
          storeId: store.$$storeId,
          filter: value,
        });
      }, 300) as (value: string) => void,
    [store.$$storeId]
  );

  return (
    <Field.Container className="w-full">
      <Field.Label>Filter</Field.Label>
      <Field.Input
        value={snap.filter}
        onChange={e => debouncedFilter(e.target.value)}
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

// Column Title component
function ColumnTitle({ children }: React.PropsWithChildren) {
  return <Text.Heading as="h3">{children}</Text.Heading>;
}

// Column namespace
const Column = {
  Container: ColumnContainer,
  Header: ColumnHeader,
  Title: ColumnTitle,
  Content: ColumnContent,
  Footer: ColumnFooter,
};

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
      <Plus className="w-4 h-4" />
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

function DeleteAction({ taskId }: DeleteActionProps) {
  const store = useContext(KanbanContext)!;

  function onClick() {
    events.kanban.deleteTask({
      storeId: store.$$storeId,
      taskId,
    });
  }

  return (
    <Clickable.Button tone="danger" onClick={onClick} size="icon">
      <Trash2 className="w-4 h-4" />
    </Clickable.Button>
  );
}

// Task EditAction component
type EditActionProps = React.PropsWithChildren<{
  taskId: string;
}>;

function EditAction({ taskId }: EditActionProps) {
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
    <Clickable.Button tone="brand" onClick={onClick} size="icon">
      <Edit2 className="w-4 h-4" />
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
    <Clickable.Button tone="brand" onClick={onClick} className="shrink-0">
      <Plus className="w-4 h-4" />
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
