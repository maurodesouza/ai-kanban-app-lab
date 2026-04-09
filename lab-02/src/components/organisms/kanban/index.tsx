'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { proxy, useSnapshot } from 'valtio';

import { Text } from '@/components/atoms/text';
import { Field } from '@/components/atoms/field';
import { Clickable } from '@/components/atoms/clickable';
import type { KanbanColumn, KankanTask } from '@/types/kanban';

import { twx } from '@/utils/tailwind';
import { events } from '@/events';
import { debounce } from '@/utils/debounce';
import { TaskModal } from '@/components/molecules/task-modal';
import {
  createKanbanStore,
  KanbanStoreState,
  removeKanbanStore,
} from '@/stores/kanban';

const KanbanContext = createContext<KanbanStoreState | null>(null);

function KanbanProvider(props: React.PropsWithChildren) {
  const [state] = useState(() => proxy(createKanbanStore()));

  useEffect(() => {
    // Cleanup: remove store when component unmounts
    return () => {
      removeKanbanStore(state.$$storeId);
    };
  }, [state.$$storeId]);

  return (
    <KanbanContext.Provider value={state}>
      {props.children}
    </KanbanContext.Provider>
  );
}

function useKanban() {
  const state = useContext(KanbanContext);
  if (!state) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return useSnapshot(state);
}

function Title() {
  const { title } = useKanban();
  return <Text.Heading hierarchy="h1">{title}</Text.Heading>;
}

const Container = twx.div`base-2 bg-background-base min-h-screen p-lg`;
const Header = twx.div`flex items-center justify-between mb-lg`;
const Content = twx.div`flex gap-lg overflow-x-auto`;

function Filter() {
  const { $$storeId } = useKanban();

  const debouncedFilter = useMemo(
    () =>
      debounce((filterValue: unknown) => {
        events.kanban.filter({
          storeId: $$storeId,
          filter: filterValue as string,
        });
      }, 300),
    [$$storeId]
  );

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    debouncedFilter(value);
  }

  return (
    <div className="flex gap-sm">
      <Field.Input
        placeholder="Search tasks..."
        onChange={handleFilterChange}
      />
    </div>
  );
}

function AddTaskButton() {
  const { $$storeId } = useKanban();

  function handleAddTask() {
    events.modal.show(() => <TaskModal kanbanStoreId={$$storeId} />);
  }

  return <Clickable.Button onClick={handleAddTask}>Add Task</Clickable.Button>;
}

function ColumnTitle(props: React.PropsWithChildren) {
  return <Text.Heading hierarchy="h3">{props.children}</Text.Heading>;
}

const ColumnContainer = twx.div`base-1 bg-background-base rounded-lg p-md min-h-96 border border-ring-inner`;
const ColumnHeader = twx.div`flex items-center justify-between mb-sm`;
const ColumnContent = twx.div`space-y-sm`;

type ColumnsProps = {
  render: (column: KanbanColumn) => React.ReactNode;
};

function Columns(props: ColumnsProps) {
  const { columns } = useKanban();

  return (
    <>
      {Object.values(columns).map(column => (
        <div key={column.id}>{props.render(column as KanbanColumn)}</div>
      ))}
    </>
  );
}

type TasksProps = {
  columnId: string;
  render: (task: KankanTask) => React.ReactNode;
};

function Tasks(props: TasksProps) {
  const { tasks } = useKanban();

  const columnTasks = Object.values(tasks).filter(
    task => task.columnId === props.columnId
  );

  return (
    <>
      {columnTasks.map(task => (
        <div key={task.id}>{props.render(task)}</div>
      ))}
    </>
  );
}

const TaskContainer = twx.div`base-1 bg-background-support rounded-md p-sm border border-ring-inner cursor-pointer transition-all hover:brightness-110`;

function TaskTitle(props: React.PropsWithChildren) {
  return <Text.Paragraph>{props.children}</Text.Paragraph>;
}

export const Kanban = {
  Provider: KanbanProvider,
  Container,
  Header,
  Content,
  Columns,
  Title,
  Filter,
  AddTaskButton,
  Tasks,
  Column: {
    Container: ColumnContainer,
    Header: ColumnHeader,
    Title: ColumnTitle,
    Content: ColumnContent,
  },
  Task: {
    Container: TaskContainer,
    Title: TaskTitle,
  },
};
