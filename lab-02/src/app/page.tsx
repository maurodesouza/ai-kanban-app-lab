'use client';

import { Kanban } from '@/components/organisms/kanban';

function KanbanBoard() {
  return (
    <Kanban.Content>
      <Kanban.Columns
        render={column => (
          <Kanban.Column.Container>
            <Kanban.Column.Header>
              <Kanban.Column.Title>{column.title}</Kanban.Column.Title>
            </Kanban.Column.Header>

            <Kanban.Column.Divider />

            <Kanban.Column.Content>
              <Kanban.Tasks
                columnId={column.id}
                render={task => (
                  <Kanban.Task.Container>
                    <Kanban.Task.Content>
                      <Kanban.Task.Title>{task.title}</Kanban.Task.Title>
                    </Kanban.Task.Content>
                    <Kanban.Task.Footer>
                      <Kanban.Task.DeleteButton taskId={task.id} />
                      <Kanban.Task.EditButton taskId={task.id} />
                    </Kanban.Task.Footer>
                  </Kanban.Task.Container>
                )}
              />
            </Kanban.Column.Content>
          </Kanban.Column.Container>
        )}
      />
    </Kanban.Content>
  );
}

export default function Home() {
  return (
    <div className="base-1 h-full p-lg bg-background-base">
      <Kanban.Provider>
        <Kanban.Container>
          <Kanban.Header>
            <Kanban.Title />
            <Kanban.Filter />
            <Kanban.AddTaskButton />
          </Kanban.Header>

          <KanbanBoard />
        </Kanban.Container>
      </Kanban.Provider>
    </div>
  );
}
