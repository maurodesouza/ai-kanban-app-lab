'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { proxy, useSnapshot } from 'valtio';

import { Text } from '@/components/atoms/text';
import { Field } from '@/components/atoms/field';
import type { Kanban as KanbanType, KanbanColumn, KankanTask } from '@/types/kanban';

import { twx } from '@/utils/tailwind';
import { random } from '@/utils/random';
import { events } from '@/events';
import { debounce } from '@/utils/debounce';

// Initial state with random IDs
const kanbanId = random.id();
const todoColumnId = random.id();
const progressColumnId = random.id();
const doneColumnId = random.id();

const initialKanbanState: KanbanType = {
  id: kanbanId,
  title: 'AI Todo App',
  columns: {
    [todoColumnId]: {
      id: todoColumnId,
      kanbanId: kanbanId,
      title: 'To Do',
      tasksId: []
    },
    [progressColumnId]: {
      id: progressColumnId,
      kanbanId: kanbanId,
      title: 'In Progress',
      tasksId: []
    },
    [doneColumnId]: {
      id: doneColumnId,
      kanbanId: kanbanId,
      title: 'Done',
      tasksId: []
    }
  },
  tasks: {}
};

const KanbanContext = createContext<KanbanType | null>(null);

function KanbanProvider(props: React.PropsWithChildren) {
  const state = useMemo(() => proxy(initialKanbanState), []);
  return (
    <KanbanContext.Provider value={state}>
      {props.children}
    </KanbanContext.Provider>
  );
};

function useKanban() {
  const state = useContext(KanbanContext);
  if (!state) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }
  return useSnapshot(state);
};


function Title(props: React.PropsWithChildren) {
  return <Text.Heading hierarchy="h1">{props.children}</Text.Heading>;
}

const Container = twx.div`base-2 bg-background-base min-h-screen p-lg`;
const Header = twx.div`flex items-center justify-between mb-lg`;
const Content = twx.div`flex gap-lg overflow-x-auto`;

function Filter() {
  const debouncedFilter = useMemo(() => 
    debounce((filterValue: unknown) => {
      events.kanban.filter({
        id: kanbanId,
        filter: filterValue as string
      });
    }, 300), []
  );

  function handleFilterChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    debouncedFilter(value);
  };

  return (
    <div className="flex gap-sm">
      <Field.Input 
        placeholder="Search tasks..." 
        onChange={handleFilterChange}
      />
    </div>
  );
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
        <div key={column.id}>
          {props.render(column as KanbanColumn)}
        </div>
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
  
  const columnTasks = Object.values(tasks).filter(task => task.columnId === props.columnId);
  
  return (
    <>
      {columnTasks.map(task => (
        <div key={task.id}>
          {props.render(task)}
        </div>
      ))}
    </>
  );
};

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
  Tasks,
  Column: {
    Container: ColumnContainer,
    Header: ColumnHeader,
    Title: ColumnTitle,
    Content: ColumnContent
  },
  Task: {
    Container: TaskContainer,
    Title: TaskTitle
  }
};
