import { Field } from "@/components/atoms/field";
import { events } from "@/events";
import { kanbanStore } from "@/stores/kanban";
import { KanbanColumn, Task as TaskType } from "@/types/task";

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
    const { columns } = kanbanStore()

    return (
        <section 
            className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 sm:pb-6 -mx-4 sm:mx-0 px-4 sm:px-0"
            role="region"
            aria-label="Kanban Columns"
        >
            {columns.map(column => props.render({ column }))}
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
    return (
        <section 
            className="flex-shrink-0 w-72 sm:w-80 lg:w-96 bg-background-support rounded-lg border border-tone-contrast-300 min-h-[500px] sm:min-h-[600px]"
            role="region"
            aria-labelledby={`column-${column.id}`}
            aria-describedby={`column-count-${column.id}`}
        >
            <div className="p-3 sm:p-4 border-b border-tone-contrast-300">
                <h3 
                    id={`column-${column.id}`}
                    className="font-semibold text-foreground text-sm sm:text-base"
                >
                    {column.title}
                    <span 
                        id={`column-count-${column.id}`}
                        className="ml-2 text-xs sm:text-sm text-foreground-min"
                        aria-label={`${column.tasks.length} tasks in ${column.title}`}
                    >
                        ({column.tasks.length})
                    </span>
                </h3>
            </div>
            <div 
                className="p-3 sm:p-4 min-h-[400px] sm:min-h-[500px] overflow-y-auto"
                role="list"
                aria-label={`Tasks in ${column.title}`}
            >
                {column.tasks.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 text-foreground-min" role="status">
                        <div className="text-3xl sm:text-4xl mb-2 sm:mb-3" aria-hidden="true">+</div>
                        <div className="text-xs sm:text-sm">Nenhuma tarefa</div>
                    </div>
                ) : (
                    <div className="space-y-2 sm:space-y-3">
                        {column.tasks.map(task => (
                            <article 
                                key={task.id} 
                                className="bg-background-base rounded p-3 sm:p-4 border border-tone-contrast-200 hover:border-tone-contrast-300 transition-colors min-h-[44px] sm:min-h-[48px] focus-within:ring-2 focus-within:ring-ring-outer focus-within:ring-offset-2"
                                role="article"
                                tabIndex={0}
                                aria-label={`Task: ${task.title}`}
                            >
                                <div className="font-medium text-foreground text-sm sm:text-base">{task.title}</div>
                                {task.description && (
                                    <div className="text-xs sm:text-sm text-foreground-min mt-1 sm:mt-2 line-clamp-2">{task.description}</div>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

function Filter() {
    const { filter } = kanbanStore()

    return (
        <div className="w-full sm:w-auto sm:flex-shrink-0">
            <label htmlFor="task-filter" className="sr-only">
                Filtrar tarefas
            </label>
            <Field.Input 
                id="task-filter"
                value={filter} 
                onChange={(event) => events.kamban.filter(event.target.value)}
                placeholder="Filtrar tarefas..."
                className="w-full sm:w-64 lg:w-80 h-11 sm:h-12 text-sm sm:text-base"
                aria-label="Filtrar tarefas por título ou descrição"
            />
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
