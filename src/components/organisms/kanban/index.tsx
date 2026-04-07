import { Field } from "@/components/atoms/field";
import { events } from "@/events";
import { kanbanStore } from "@/stores/kanban";
import { KanbanColumn, Task as TaskType } from "@/types/task";

function Root({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background-base p-4">
            <div className="container mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    );
}

function Header({ children }: { children: React.ReactNode }) {
    return <div className="mb-6">{children}</div>;
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
        <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map(column => props.render({ column }))}
        </div>
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
        <div className="flex-shrink-0 w-80 bg-background-support rounded-lg border border-tone-contrast-300">
            <div className="p-4 border-b border-tone-contrast-300">
                <h3 className="font-semibold text-foreground">
                    {column.title}
                    <span className="ml-2 text-sm text-foreground-min">
                        ({column.tasks.length})
                    </span>
                </h3>
            </div>
            <div className="p-4 min-h-[400px]">
                {column.tasks.length === 0 ? (
                    <div className="text-center py-8 text-foreground-min">
                        <div className="text-4xl mb-2">+</div>
                        <div>Nenhuma tarefa</div>
                    </div>
                ) : (
                    column.tasks.map(task => (
                        <div key={task.id} className="bg-background-base rounded p-3 mb-2 border border-tone-contrast-200">
                            <div className="font-medium text-foreground">{task.title}</div>
                            {task.description && (
                                <div className="text-sm text-foreground-min mt-1">{task.description}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

function Filter() {
    const { filter } = kanbanStore()

    return (
        <div className="mb-6">
            <Field.Input 
                value={filter} 
                onChange={(event) => events.kamban.filter(event.target.value)}
                placeholder="Filtrar tarefas..."
                className="w-full max-w-md"
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
