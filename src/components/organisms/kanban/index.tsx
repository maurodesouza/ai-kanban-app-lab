import { Field } from "@/components/atoms/field";
import { events } from "@/events";
import { useKanbanStore } from "@/stores/kanban";
import { TaskCard } from "@/components/molecules/Task/TaskCard";
import { KanbanColumn, Task as TaskType } from "@/types/task";
import { useDroppable } from "@dnd-kit/core";
import { useDropHandle } from "@/components/handles/dragHandles";
import { useState, useEffect } from "react";

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function Root({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background-base p-4 sm:p-6" role="main" aria-label="Kanban Board">
            <div className="container mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    );
}

function Header({ children }: { children: React.ReactNode }) {
    return (
        <header className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {children}
            </div>
        </header>
    );
}

type ColumnsRenderProps = {
    column: KanbanColumn
}

type ColumnsProps = {
    render: (props: ColumnsRenderProps) => React.ReactNode
}

function Columns(props: ColumnsProps) {
    const { columns, getFilteredTasksByStatus } = useKanbanStore()

    // Create filtered columns for rendering
    const filteredColumns = columns.map((column: KanbanColumn) => ({
        ...column,
        tasks: getFilteredTasksByStatus(column.tasks, column.status)
    }));

    return (
        <section 
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-6 -mx-4 sm:mx-0 px-4 sm:px-0"
            role="region"
            aria-label="Kanban Columns"
        >
            {filteredColumns.map((column: KanbanColumn) => props.render({ column }))}
        </section>
    );
}

type ColumnRenderProps = {
    task: TaskType
}

type ColumnProps = {
    render: (props: ColumnRenderProps) => React.ReactNode
}

function Column({ column }: { column: KanbanColumn }) {
    const { isOver, setNodeRef } = useDroppable({
        id: column.status,
    });

    const { onDragEnd } = useDropHandle(column.status);
    const { hasActiveFilter } = useKanbanStore();

    return (
        <section 
            ref={setNodeRef}
            className={`flex-shrink-0 w-72 sm:w-80 lg:w-96 bg-background-support rounded-lg border-2 min-h-[500px] sm:min-h-[600px] transition-all duration-200 ${
                isOver 
                    ? 'border-tone-primary-500 bg-background-support-hover scale-105 shadow-lg' 
                    : 'border-tone-contrast-300'
            }`}
            role="region"
            aria-labelledby={`column-${column.id}`}
            aria-describedby={`column-count-${column.id}`}
        >
            <div className={`p-3 sm:p-4 border-b transition-colors ${
                isOver ? 'border-tone-primary-500 bg-tone-primary-50' : 'border-tone-contrast-300'
            }`}>
                <h3 
                    id={`column-${column.id}`}
                    className="font-semibold text-foreground text-sm sm:text-base flex items-center gap-2"
                >
                    {column.title}
                    <span 
                        id={`column-count-${column.id}`}
                        className="ml-2 text-xs sm:text-sm text-foreground-min"
                        aria-label={`${column.tasks.length} tasks in ${column.title}`}
                    >
                        ({column.tasks.length})
                    </span>
                    {isOver && (
                        <span className="text-xs text-tone-primary-600 font-medium animate-pulse">
                            Drop here
                        </span>
                    )}
                </h3>
            </div>
            <div 
                className="p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] overflow-y-auto"
                role="list"
                aria-label={`Tasks in ${column.title}`}
            >
                {column.tasks.length === 0 ? (
                    <div className={`text-center py-8 sm:py-12 transition-colors ${
                        isOver ? 'text-tone-primary-600' : 'text-foreground-min'
                    }`} role="status">
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3" aria-hidden="true">
                            {isOver ? ' dropping to ' : (hasActiveFilter ? ' no results' : '+')}
                        </div>
                        <div className="text-xs sm:text-sm">
                            {isOver ? 'Release to add task' : (hasActiveFilter ? 'No matching tasks' : 'Nenhuma tarefa')}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {column.tasks.map(task => (
                            <TaskCard.Root key={task.id} task={task} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function Filter() {
    const { filter, setFilter, isLoading } = useKanbanStore()
    const [localFilter, setLocalFilter] = useState(filter)
    const debouncedFilter = useDebounce(localFilter, 300)

    // Update the store when debounced value changes
    useEffect(() => {
        setFilter(debouncedFilter)
    }, [debouncedFilter, setFilter])

    // Keep local state in sync with store
    useEffect(() => {
        setLocalFilter(filter)
    }, [filter])

    return (
        <div className="w-full sm:w-auto sm:flex-shrink-0 relative">
            <label htmlFor="task-filter" className="sr-only">
                Filtrar tarefas
            </label>
            <div className="relative">
                <Field.Input 
                    id="task-filter"
                    value={localFilter} 
                    onChange={(event) => setLocalFilter(event.target.value)}
                    placeholder="Filtrar tarefas... (Ctrl+K)"
                    className="w-full sm:w-64 lg:w-80 h-11 sm:h-12 text-sm sm:text-base pr-10"
                    aria-label="Filtrar tarefas por título ou descrição (Ctrl+K)"
                    title="Filter tasks (Ctrl+K)"
                    disabled={isLoading}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-tone-primary-500 border-t-transparent rounded-full" aria-hidden="true" />
                    </div>
                )}
                {localFilter && !isLoading && (
                    <button
                        type="button"
                        onClick={() => setLocalFilter('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-tone-contrast-500 hover:text-tone-contrast-700 transition-colors"
                        aria-label="Clear filter"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

const Kanban = {
    Root,
    Header,
    Columns,
    Column,
    Filter,
};

export { Kanban };
