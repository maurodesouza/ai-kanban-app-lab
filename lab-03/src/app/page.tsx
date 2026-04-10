'use client';

import { Kanban } from '@/components/organisms/kanban';

function KanbanBoard() {
  return (
    <Kanban.Container>
      <Kanban.Header>
        <Kanban.Title />
        <Kanban.Filter />
        <Kanban.AddTaskAction />
      </Kanban.Header>

      <Kanban.Content>
        <Kanban.Columns
          render={column => (
            <Kanban.Column.Container>
              <Kanban.Column.Header>
                <Kanban.Column.Title>{column.title}</Kanban.Column.Title>
              </Kanban.Column.Header>

              <Kanban.Column.Content>
                <Kanban.Task.Tasks
                  columnId={column.id}
                  render={task => (
                    <Kanban.Task.Container>
                      <Kanban.Task.Header>
                        <Kanban.Task.Title>{task.title}</Kanban.Task.Title>
                      </Kanban.Task.Header>

                      <Kanban.Task.Footer>
                        <Kanban.Task.DeleteAction taskId={task.id} />
                        <Kanban.Task.EditAction taskId={task.id} />
                      </Kanban.Task.Footer>
                    </Kanban.Task.Container>
                  )}
                />

                <Kanban.Column.Footer>
                  <Kanban.Task.AddTaskAction columnId={column.id}>
                    Add Task
                  </Kanban.Task.AddTaskAction>
                </Kanban.Column.Footer>
              </Kanban.Column.Content>
            </Kanban.Column.Container>
          )}
        />
      </Kanban.Content>
    </Kanban.Container>
  );
}

export default function Home() {
  return (
    <Kanban.Provider title="AI Todo App">
      <KanbanBoard />
    </Kanban.Provider>
  );
}
