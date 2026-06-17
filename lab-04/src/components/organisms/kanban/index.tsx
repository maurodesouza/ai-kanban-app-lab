'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSnapshot } from 'valtio';
import { ChevronLeft, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { twx, cn } from '@/utils/tailwind';
import { Clickable } from '@/components/atoms/clickable';
import { Text } from '@/components/atoms/text';
import { Field } from '@/components/molecules/field';
import { events } from '@/events';
import { kanbanStore } from '@/stores/kanban';
import { TaskModal } from '@/components/molecules/task-modal';
import { debounce } from '@/utils/debounce';
import type { KanbanStoreState, Column, Task } from '@/types/kanban';

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

function useKanban() {
  const store = useContext(KanbanContext);

  if (!store) {
    throw new Error('useKanban must be used within a KanbanProvider');
  }

  return useSnapshot(store);
}

const Container = twx.div`base-1 flex flex-col gap-lg bg-background-base h-full`;
const Header = twx.div`flex gap-md items-end`;
const Content = twx.div`flex gap-md h-full overflow-x-auto`;

const ColumnContainer = twx.div`base-1 flex flex-col bg-background-base border border-ring-inner rounded-md min-w-60`;

const AddColumnContainer = twx.div`base-2 flex flex-col bg-background-support border border-dashed border-ring-outer rounded-md min-w-60 h-full items-center justify-center cursor-pointer brightness-50 hover:brightness-100 transition-all`;
const ColumnHeader = twx.div`flex flex-col min-h-0 border-b border-ring-inner p-md`;

type EditableColumnTitleProps = {
  columnId: string;
  title: string;
};

function EditableColumnTitle({ columnId, title }: EditableColumnTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [error, setError] = useState('');
  const store = useContext(KanbanContext)!;
  const inputRef = React.useRef<HTMLInputElement>(null);

  const MAX_CHARS = 20;
  const MIN_CHARS = 1;

  function startEditing() {
    setIsEditing(true);
    setEditValue(title);
    setError('');
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditValue(title);
    setError('');
  }

  function saveEditing() {
    if (editValue.trim().length < MIN_CHARS) {
      setError('Column name is required');
      return;
    }

    if (editValue.length > MAX_CHARS) {
      setError(`Maximum ${MAX_CHARS} characters`);
      return;
    }

    if (editValue.trim() !== title) {
      events.kanban.updateColumn({
        storeId: store.$$storeId,
        columnId,
        data: { title: editValue.trim() },
      });
    }

    setIsEditing(false);
    setError('');
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      saveEditing();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleBlur() {
    saveEditing();
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-md w-full">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={e => {
            setEditValue(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`w-full px-xs py-1 text-sm font-medium bg-background-base border rounded ${
            error
              ? 'tone palette-danger border-tone-contrast-500 text-tone-contrast-500'
              : 'focus:border-ring-outer'
          }`}
          maxLength={MAX_CHARS}
          placeholder="Column name"
        />
        {error && <Field.Error>{error}</Field.Error>}
      </div>
    );
  }

  return (
    <Text.Heading
      as="h3"
      className="cursor-pointer hover:brightness-110 transition-all"
      onClick={startEditing}
      title="Click to edit"
    >
      {title}
    </Text.Heading>
  );
}

type ColumnContentProps = React.PropsWithChildren<{
  columnId: string;
}>;

function ColumnContent({ columnId, children }: ColumnContentProps) {
  const snap = useKanban();
  const [isDragOver, setIsDragOver] = useState(false);

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragOver(false);

    const taskId = event.dataTransfer.getData('taskId');
    const sourceColumnId = event.dataTransfer.getData('sourceColumnId');

    if (!taskId || !sourceColumnId || sourceColumnId === columnId) {
      return;
    }

    events.kanban.moveTask({
      storeId: snap.$$storeId,
      taskId,
      fromColumnId: sourceColumnId,
      toColumnId: columnId,
    });
  }

  return (
    <div
      className={cn(
        'h-full flex flex-col gap-xs p-md',
        'border border-transparent transition-colors',
        isDragOver && 'tone palette-brand border-tone-ring-inner'
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

const ColumnFooter = twx.div`flex justify-evenly gap-xs border-t border-ring-inner p-md`;

const TaskContainer = twx.div`base-1 bg-background-base border border-ring-inner rounded-md`;

type DraggableProps = React.PropsWithChildren<{
  taskId: string;
  columnId: string;
}>;

function Draggable({ taskId, columnId, children }: DraggableProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleDragStart(event: React.DragEvent) {
    event.dataTransfer.setData('taskId', taskId);
    event.dataTransfer.setData('sourceColumnId', columnId);
    event.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }

  return (
    <div
      className={cn(
        'transition-opacity hover:opacity-80',
        isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-move'
      )}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  );
}

TaskContainer.displayName = 'TaskContainer';
const TaskHeader = twx.div`p-xs`;
const TaskFooter = twx.div`flex justify-end gap-xs p-xs border-t border-ring-inner`;

function Title() {
  const snap = useKanban();

  return (
    <Text.Heading as="h2" className="self-center shrink-0">
      {snap.title}
    </Text.Heading>
  );
}

function Filter({ children }: React.PropsWithChildren) {
  const store = useContext(KanbanContext)!;

  const debouncedFilter = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const value = args[0] as string;
        events.kanban.filter({
          storeId: store.$$storeId,
          filter: value,
        });
      }, 300),
    [store.$$storeId]
  );

  return (
    <Field.Container className="w-full">
      <Field.Label>Filter tasks</Field.Label>
      <Field.Input
        placeholder="Search by title or description..."
        onChange={e => debouncedFilter(e.target.value)}
      />
      {children}
    </Field.Container>
  );
}

function Column({ columnId }: { columnId: string }) {
  const snap = useKanban();
  const column = snap.columns[columnId];
  const tasks = snap.$columnsWithTasks[columnId] || {};

  if (!column) return null;

  return (
    <ColumnContainer>
      <ColumnHeader>
        <EditableColumnTitle columnId={columnId} title={column.title} />
      </ColumnHeader>
      <ColumnContent columnId={columnId}>
        {Object.values(tasks).map(task => (
          <Task key={task.id} taskId={task.id} columnId={columnId} />
        ))}
      </ColumnContent>
      <ColumnFooter>
        <Clickable.Button
          size="icon"
          variant="ghost"
          onClick={() => {
            events.modal.show(
              <TaskModal storeId={snap.$$storeId} columnId={columnId} />
            );
          }}
        >
          <Plus />
        </Clickable.Button>
        <Clickable.Button
          size="icon"
          variant="ghost"
          onClick={() => {
            events.kanban.moveColumnLeft({
              storeId: snap.$$storeId,
              columnId,
            });
          }}
        >
          <ChevronLeft />
        </Clickable.Button>
        <Clickable.Button
          size="icon"
          variant="ghost"
          onClick={() => {
            events.kanban.moveColumnRight({
              storeId: snap.$$storeId,
              columnId,
            });
          }}
        >
          <ChevronRight />
        </Clickable.Button>
        <Clickable.Button
          size="icon"
          variant="ghost"
          onClick={() => {
            events.kanban.deleteColumn({
              storeId: snap.$$storeId,
              columnId,
            });
          }}
        >
          <Trash2 />
        </Clickable.Button>
      </ColumnFooter>
    </ColumnContainer>
  );
}

function Task({ taskId, columnId }: { taskId: string; columnId: string }) {
  const snap = useKanban();
  const task = snap.tasks[taskId];

  if (!task) return null;

  return (
    <Draggable taskId={taskId} columnId={columnId}>
      <TaskContainer>
        <TaskHeader>
          <Text.Paragraph className="font-medium">{task.title}</Text.Paragraph>
        </TaskHeader>
        {task.description && (
          <div className="p-xs">
            <Text.Small>{task.description}</Text.Small>
          </div>
        )}
        {task.dueDate && (
          <div className="p-xs">
            <Text.Small>Due: {task.dueDate}</Text.Small>
          </div>
        )}
        <TaskFooter>
          <Clickable.Button
            size="icon"
            variant="ghost"
            onClick={() => {
              events.modal.show(
                <TaskModal storeId={snap.$$storeId} task={task} />
              );
            }}
          >
            <Edit2 />
          </Clickable.Button>
          <Clickable.Button
            size="icon"
            variant="ghost"
            onClick={() => {
              events.kanban.deleteTask({
                storeId: snap.$$storeId,
                taskId,
              });
            }}
          >
            <Trash2 />
          </Clickable.Button>
        </TaskFooter>
      </TaskContainer>
    </Draggable>
  );
}

function Columns() {
  const snap = useKanban();

  return (
    <Content>
      {Object.keys(snap.columns).map(columnId => (
        <Column key={columnId} columnId={columnId} />
      ))}
      <AddColumnContainer
        onClick={() => {
          events.kanban.createColumn({
            storeId: snap.$$storeId,
            data: {
              kanbanId: snap.id,
              title: 'New Column',
              tasksId: [],
            },
          });
        }}
      >
        <Plus />
        <Text.Paragraph>Add Column</Text.Paragraph>
      </AddColumnContainer>
    </Content>
  );
}

function Kanban() {
  return (
    <KanbanProvider>
      <Container>
        <Header>
          <Title />
          <Filter />
        </Header>
        <Columns />
      </Container>
    </KanbanProvider>
  );
}

export { Kanban };
