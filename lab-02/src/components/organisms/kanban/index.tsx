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
import { Plus, Edit, Trash2 } from 'lucide-react';

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
  return <Text.Heading as="h2">{title}</Text.Heading>;
}

const Container = twx.div`base-2 bg-background-base w-full h-full flex flex-col gap-md border border-ring-inner rounded-md p-lg`;
const Header = twx.div`w-full flex gap-4 py-lg`;
const Content = twx.div`flex w-full h-full gap-md overflow-x-auto`;

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
    <div className="w-full flex-1">
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

  return (
    <Clickable.Button tone="brand" onClick={handleAddTask}>
      <Plus />
      Add Task
    </Clickable.Button>
  );
}

function ColumnTitle(props: React.PropsWithChildren) {
  return <Text.Strong>{props.children}</Text.Strong>;
}

const ColumnContainer = twx.div`base-1 bg-background-base rounded-md h-full w-[230px] border border-ring-inner`;
const ColumnHeader = twx.div`flex gap-md p-md`;
const ColumnContent = twx.div`flex flex-col gap-sm p-md`;
const ColumnDivider = twx.div`w-full h-px bg-ring-inner`;

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
  const { $columnIdsWithTasks } = useKanban();

  const columnTasks = Object.values($columnIdsWithTasks[props.columnId] || {});

  return (
    <>
      {columnTasks.map(task => (
        <div key={task.id}>{props.render(task)}</div>
      ))}
    </>
  );
}

const TaskContainer = twx.div`bg-background-support rounded-md border border-ring-inner cursor-move transition-all hover:brightness-110`;

const TaskContent = twx.div`py-xxs px-xs`;

const TaskActionsContainer = twx.div`flex gap-xs justify-end py-xxs px-xs border-t border-ring-inner`;

function EditButton(props: { taskId: string }) {
  const { taskId } = props;
  const { $$storeId: storeId, tasks } = useKanban();

  const task = tasks[taskId];

  function handleEdit() {
    if (!task) return;

    events.modal.show(() => <TaskModal kanbanStoreId={storeId} task={task} />);
  }

  return (
    <Clickable.Button
      type="button"
      variant="ghost"
      size="icon"
      tone="brand"
      onClick={handleEdit}
    >
      <Edit className="size-4" />
    </Clickable.Button>
  );
}

function DeleteButton(props: { taskId: string }) {
  const { taskId } = props;
  const { $$storeId: storeId } = useKanban();

  function handleDelete() {
    events.kanban.deleteTask({
      storeId,
      data: taskId,
    });
  }

  return (
    <Clickable.Button
      type="button"
      variant="ghost"
      size="icon"
      tone="danger"
      onClick={handleDelete}
    >
      <Trash2 className="size-4" />
    </Clickable.Button>
  );
}

const TaskFooter = TaskActionsContainer;

function TaskDraggable(props: { taskId: string; children: React.ReactNode }) {
  const { taskId } = props;
  const { $$storeId: storeId, tasks } = useKanban();

  const task = tasks[taskId];

  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', taskId);
    event.dataTransfer.setData('fromColumnId', task.columnId);

    // Emit drag start event
    events.kanban.dragStart({
      storeId,
      taskId,
      fromColumnId: task.columnId,
    });
  }

  function handleDragEnd() {
    // This will be handled by the drop zone
  }

  return (
    <TaskContainer
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {props.children}
    </TaskContainer>
  );
}

function DropZone(props: { columnId: string; children: React.ReactNode }) {
  const { columnId } = props;
  const { $$storeId: storeId } = useKanban();

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();

    const taskId = event.dataTransfer.getData('text/plain');
    const fromColumnId = event.dataTransfer.getData('fromColumnId');

    if (!fromColumnId) {
      console.error('No fromColumnId found in drag data');
      return;
    }

    // Emit drag end event
    events.kanban.dragEnd({
      storeId,
      taskId,
      fromColumnId,
      toColumnId: columnId,
    });
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="min-h-[100px] w-full"
    >
      {props.children}
    </div>
  );
}

function TaskTitle(props: React.PropsWithChildren) {
  return <Text.Paragraph>{props.children}</Text.Paragraph>;
}

export const Kanban = {
  Provider: KanbanProvider,
  useKanban,
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
    Divider: ColumnDivider,
    DropZone,
  },
  Task: {
    Container: TaskContainer,
    Content: TaskContent,
    Footer: TaskFooter,
    Title: TaskTitle,
    Draggable: TaskDraggable,
    EditButton,
    DeleteButton,
  },
};
