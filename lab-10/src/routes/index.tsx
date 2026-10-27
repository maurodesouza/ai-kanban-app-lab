import { createFileRoute } from "@tanstack/react-router";
import { ThemeToggle } from "#/components/theme-toggle/theme-toggle";
import { KanbanHandles } from "#/features/kanban/components/handles/kanban-handles";
import { Kanban } from "#/features/kanban/components/kanban/kanban";

export const Route = createFileRoute("/")({
    component: Home,
});

function Home() {
    return (
        <>
            <KanbanHandles />

            <Kanban.Container>
                <Kanban.Header>
                    <Kanban.Title />

                    <Kanban.Toolbar>
                        <ThemeToggle />
                    </Kanban.Toolbar>
                </Kanban.Header>

                <Kanban.Content>
                    <Kanban.DndProvider>
                        <Kanban.Columns
                            render={(column) => (
                                <Kanban.Column.Container column={column}>
                                    <Kanban.Column.Header>
                                        <Kanban.Column.DragHandle
                                            column={column}
                                        />
                                        <Kanban.Column.Title column={column} />
                                        <Kanban.Column.Count column={column} />

                                        <Kanban.Column.Actions>
                                            <Kanban.Column.MoveLeftAction
                                                column={column}
                                            />
                                            <Kanban.Column.MoveRightAction
                                                column={column}
                                            />
                                            <Kanban.Column.Menu column={column}>
                                                <Kanban.Column.RenameAction
                                                    column={column}
                                                />
                                                <Kanban.Column.DeleteAction
                                                    column={column}
                                                />
                                            </Kanban.Column.Menu>
                                        </Kanban.Column.Actions>
                                    </Kanban.Column.Header>

                                    <Kanban.Column.Content />
                                </Kanban.Column.Container>
                            )}
                        />

                        <Kanban.GhostColumn />
                    </Kanban.DndProvider>
                </Kanban.Content>
            </Kanban.Container>

            <Kanban.ColumnDeleteDialog.Root>
                <Kanban.ColumnDeleteDialog.Header>
                    <Kanban.ColumnDeleteDialog.Title />
                    <Kanban.ColumnDeleteDialog.Description />
                </Kanban.ColumnDeleteDialog.Header>

                <Kanban.ColumnDeleteDialog.Footer>
                    <Kanban.ColumnDeleteDialog.Cancel />
                    <Kanban.ColumnDeleteDialog.Confirm />
                </Kanban.ColumnDeleteDialog.Footer>
            </Kanban.ColumnDeleteDialog.Root>
        </>
    );
}
