import { fireEvent, render, screen } from "@testing-library/react";

import { Kanban } from "./index";
import "#/lib/command/handlers/index";
import { kanbanState, resetKanbanState } from "#/stores/kanban";

describe("Kanban", () => {
    beforeEach(() => resetKanbanState());

    it("renders the board and tasks", () => {
        render(
            <Kanban.Container>
                <Kanban.Columns
                    render={(column) => (
                        <Kanban.Column.Container key={column.id}>
                            <Kanban.Column.Header>
                                <Kanban.Column.Title columnId={column.id}>
                                    {column.title}
                                </Kanban.Column.Title>
                            </Kanban.Column.Header>
                            <Kanban.Column.Content>
                                <Kanban.Tasks
                                    columnId={column.id}
                                    render={(task) => (
                                        <Kanban.Task.Container key={task.id}>
                                            <Kanban.Task.Header>
                                                <Kanban.Task.Title>
                                                    {task.title}
                                                </Kanban.Task.Title>
                                            </Kanban.Task.Header>
                                            <Kanban.Task.Footer>
                                                <Kanban.Task.DeleteAction
                                                    taskId={task.id}
                                                />
                                            </Kanban.Task.Footer>
                                        </Kanban.Task.Container>
                                    )}
                                />
                            </Kanban.Column.Content>
                        </Kanban.Column.Container>
                    )}
                />
            </Kanban.Container>,
        );

        expect(screen.getByDisplayValue("To Do")).toBeTruthy();
        expect(screen.getByText("Welcome task")).toBeTruthy();
    });

    it("dispatches a command when deleting a task", async () => {
        const task = kanbanState.tasks[0];
        const before = kanbanState.tasks.length;

        render(<Kanban.Task.DeleteAction taskId={task?.id as string} />);

        fireEvent.click(screen.getByTitle("Delete task"));

        expect(kanbanState.tasks.length).toBeLessThan(before);
    });
});
