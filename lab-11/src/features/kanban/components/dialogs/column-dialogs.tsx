import { observer } from "mobx-react-lite";
import { Clickable } from "#/components/atoms/clickable";
import { Input } from "#/components/atoms/fields";
import { Dialog } from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { actions } from "#/lib/command";
import { useKanban } from "../../hooks/use-kanban";

export const ColumnRenameContent = observer(function ColumnRenameContent() {
    const ui = useKanban().$columnRenameUI;
    if (!ui) return null;
    return (
        <Dialog.Content>
            <form
                noValidate
                onSubmit={(event) => {
                    event.preventDefault();
                    void actions.column.rename();
                }}
            >
                <Dialog.Header>
                    <Dialog.Title>Rename column</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                    <Field.Root invalid={ui.invalid}>
                        <Field.Label htmlFor={ui.titleId}>
                            Column name
                        </Field.Label>
                        <Field.Row>
                            <Field.Body>
                                <Input
                                    id={ui.titleId}
                                    value={ui.title}
                                    onChange={(event) =>
                                        void actions.column.changeTitle({
                                            title: event.currentTarget.value,
                                        })
                                    }
                                />
                            </Field.Body>
                        </Field.Row>
                        <Field.Error match={ui.invalid}>{ui.error}</Field.Error>
                    </Field.Root>
                </Dialog.Body>
                <Dialog.Footer>
                    <Clickable.Button
                        type="button"
                        variant="ghost"
                        onClick={() => void actions.modal.close()}
                    >
                        Cancel
                    </Clickable.Button>
                    <Clickable.Button type="submit" className="palette-blue">
                        Save column
                    </Clickable.Button>
                </Dialog.Footer>
            </form>
        </Dialog.Content>
    );
});

export const ColumnDeleteContent = observer(function ColumnDeleteContent({
    columnId,
}: {
    columnId: string;
}) {
    const ui = useKanban().$columnUI.get(columnId)?.confirmation;
    if (!ui) return null;
    return (
        <Dialog.Content>
            <Dialog.Header>
                <Dialog.Title>{ui.title}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
                <Dialog.Description>{ui.description}</Dialog.Description>
            </Dialog.Body>
            <Dialog.Footer>
                <Clickable.Button
                    type="button"
                    variant="ghost"
                    onClick={() => void actions.modal.close()}
                >
                    Cancel
                </Clickable.Button>
                <Clickable.Button
                    type="button"
                    className="palette-danger"
                    onClick={() => void actions.column.delete({ columnId })}
                >
                    Delete column
                </Clickable.Button>
            </Dialog.Footer>
        </Dialog.Content>
    );
});
