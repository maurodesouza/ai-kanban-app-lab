'use client';

import { Kanban } from '@/components/organisms/kanban';
import { ThemeToggle } from '@/components/molecules/theme-toggle';

function KanbanBoard() {
  return (
    <Kanban.Container>
      <Kanban.Header>
        <Kanban.Title />
        <Kanban.Filter />
        <Kanban.GlobalAddTaskAction />
        <ThemeToggle />
      </Kanban.Header>

      <Kanban.Content>
        <Kanban.Columns
          render={column => (
            <Kanban.Column.Container key={column.id}>
              <Kanban.Column.Header>
                <Kanban.Column.Title
                  columnId={column.id}
                  title={column.title}
                />
              </Kanban.Column.Header>

              <Kanban.Column.Content columnId={column.id}>
                <Kanban.Tasks
                  columnId={column.id}
                  render={task => (
                    <Kanban.Task.Draggable
                      key={task.id}
                      taskId={task.id}
                      columnId={column.id}
                    >
                      <Kanban.Task.Container>
                        <Kanban.Task.Header>
                          <Kanban.Task.Title>{task.title}</Kanban.Task.Title>
                        </Kanban.Task.Header>

                        <Kanban.Task.Footer>
                          <Kanban.Task.DeleteAction taskId={task.id} />
                          <Kanban.Task.EditAction taskId={task.id} />
                        </Kanban.Task.Footer>
                      </Kanban.Task.Container>
                    </Kanban.Task.Draggable>
                  )}
                />
              </Kanban.Column.Content>

              <Kanban.Column.Footer>
                <Kanban.Column.AddTaskAction columnId={column.id} />
              </Kanban.Column.Footer>
            </Kanban.Column.Container>
          )}
        />
        <Kanban.AddColumnAction />
      </Kanban.Content>
    </Kanban.Container>
  );
}

export default function Home() {
  return (
    <div className="base-1 h-full p-xxl bg-background-base">
      <Kanban.Provider title="AI Todo App">
        <KanbanBoard />
      </Kanban.Provider>
    </div>
  );
}
