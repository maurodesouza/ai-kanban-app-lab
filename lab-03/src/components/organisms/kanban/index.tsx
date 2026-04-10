'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useSnapshot } from 'valtio';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { twx, cn } from '@/utils/tailwind/index';
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

const AddColumnContainer = twx.div`base-2 flex flex-col bg-background-support border border-dashed border-ring-outer rounded-md min-w-60 h-full items-center justify-center cursor-pointer brightness-50 hover:brightness-100 transition-all`;
const ColumnHeader = twx.div`flex flex-col min-h-0 border-b border-ring-inner p-md`;

// Editable column title component
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
    // Validation
    if (editValue.trim().length < MIN_CHARS) {
      setError('Column name is required');
      return;
    }

    if (editValue.length > MAX_CHARS) {
      setError(`Maximum ${MAX_CHARS} characters`);
      return;
    }

    // Only update if value changed
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

// Column content with drop handlers
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
const ColumnFooter = twx.div`flex gap-xs border-t border-ring-inner p-md`;

const TaskContainer = twx.div`base-1 bg-background-base border border-ring-inner rounded-md`;

// Draggable task wrapper component
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
      }, 300),
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
    <>
      {Object.values(snap.columns).map(column => (
        <React.Fragment key={column.id}>
          {render(column as Column)}
        </React.Fragment>
      ))}
    </>
  );
}

// Column namespace
const Column = {
  Container: ColumnContainer,
  Header: ColumnHeader,
  Title: EditableColumnTitle,
  Content: ColumnContent,
  Footer: ColumnFooter,
  AddTaskAction,
  DeleteColumnAction,
};

// Tasks component
type TasksProps = {
  columnId: string;
  render: (task: Task) => React.ReactNode;
};

function Tasks({ columnId, render }: TasksProps) {
  const snap = useKanban();
  const columnTasks = snap.$columnsWithTasks[columnId] || {};

  return (
    <>
      {Object.values(columnTasks).map(task => (
        <React.Fragment key={task.id}>{render(task)}</React.Fragment>
      ))}
    </>
  );
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
    <Clickable.Button tone="brand" size="full" onClick={onClick}>
      <Plus className="w-4 h-4" />
      {children || 'Add Task'}
    </Clickable.Button>
  );
}

// DeleteColumnAction component
type DeleteColumnActionProps = {
  columnId: string;
};

function DeleteColumnAction({ columnId }: DeleteColumnActionProps) {
  const store = useContext(KanbanContext)!;
  const snap = useSnapshot(store);

  function onClick() {
    const column = snap.columns[columnId];
    if (!column) return;

    // Check if column has tasks
    const taskCount = column.tasksId.length;
    const hasTasks = taskCount > 0;

    // Show confirmation message
    const confirmMessage = hasTasks
      ? `Are you sure you want to delete "${column.title}"? This will also delete ${taskCount} task${taskCount > 1 ? 's' : ''} in this column.`
      : `Are you sure you want to delete "${column.title}"?`;

    if (window.confirm(confirmMessage)) {
      events.kanban.deleteColumn({
        storeId: store.$$storeId,
        columnId,
      });
    }
  }

  return (
    <Clickable.Button tone="danger" onClick={onClick}>
      <Trash2 className="w-4 h-4" />
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
  Draggable,
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

// AddColumnAction component
type AddColumnActionProps = React.PropsWithChildren;

function AddColumnAction({ children }: AddColumnActionProps) {
  const store = useContext(KanbanContext)!;
  const snap = useSnapshot(store);

  function onClick() {
    const columnCount = Object.keys(snap.columns).length;
    const newColumnTitle = `Column ${columnCount + 1}`;

    events.kanban.createColumn({
      storeId: store.$$storeId,
      data: {
        kanbanId: snap.id,
        title: newColumnTitle,
        tasksId: [],
      },
    });
  }

  return (
    <AddColumnContainer onClick={onClick}>
      <Plus className="w-8 h-8 text-foreground-min mb-xs" />
      <Text.Paragraph className="text-foreground-min text-center">
        {children || 'Add Column'}
      </Text.Paragraph>
    </AddColumnContainer>
  );
}

// Export composition
export const Kanban = {
  Provider: KanbanProvider,
  Container,
  Header,
  Title,
  Filter,
  GlobalAddTaskAction,
  Content,
  Columns,
  AddColumnAction,
  Column: {
    Container: ColumnContainer,
    Header: ColumnHeader,
    Title: EditableColumnTitle,
    Content: ColumnContent,
    Footer: ColumnFooter,
    AddTaskAction,
    DeleteColumnAction,
  },
  Task,
  Tasks,
  AddTaskAction,
};

// Export hook separately
export { useKanban };
