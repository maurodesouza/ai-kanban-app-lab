'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Field } from '@/components/atoms/field';
import { Clickable } from '@/components/atoms/clickable';
import { Dialog } from '@/components/atoms/dialog';
import { SelectComponent } from '@/components/atoms/select';

import { taskFormSchema, TaskFormValues } from './schema';
import type { KankanTask, KanbanColumn } from '@/types/kanban';
import { kanbanStores } from '@/stores/kanban';
import { events } from '@/events';
import { random } from '@/utils/random';

export type TaskModalProps = {
  kanbanStoreId: string;
  task?: KankanTask;
};

export function TaskModal(props: TaskModalProps) {
  const { kanbanStoreId, task } = props;

  const kanbanStore = kanbanStores.get(kanbanStoreId);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || '',
      columnId: task?.columnId || '',
    },
  });

  function onSubmit(data: TaskFormValues) {
    if (!kanbanStore) return;

    const taskData = {
      id: `task-${random.id()}`,
      ...data,
      kanbanId: kanbanStore.id,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: data.description || '',
      dueDate: data.dueDate || '',
    };

    const action = task ? 'editTask' : 'addTask';

    events.kanban[action]({
      storeId: kanbanStoreId,
      data: taskData,
    });

    events.modal.hide();
  }

  function onCancel() {
    events.modal.hide();
  }

  useEffect(() => {
    if (!kanbanStore || task) return;

    const firstColumn = Object.values(kanbanStore.columns)[0];

    if (!firstColumn) return;

    form.setValue('columnId', firstColumn.id);
  }, [kanbanStore, task, form]);

  if (!kanbanStore) {
    events.modal.hide();

    return null;
  }

  const columnOptions = Object.values(kanbanStore.columns).map(column => ({
    value: (column as KanbanColumn).id,
    label: (column as KanbanColumn).title,
  }));

  const isEditMode = !!task;

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{isEditMode ? 'Edit Task' : 'Create Task'}</Dialog.Title>
      </Dialog.Header>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <Field.Container>
            <Field.Label>Title *</Field.Label>
            <Field.Input
              {...form.register('title')}
              placeholder="Enter task title"
            />
            {form.formState.errors.title && (
              <Field.Error>{form.formState.errors.title.message}</Field.Error>
            )}
          </Field.Container>

          <Field.Container>
            <Field.Label>Description</Field.Label>
            <Field.Textarea
              {...form.register('description')}
              placeholder="Enter task description"
              rows={3}
            />
            {form.formState.errors.description && (
              <Field.Error>
                {form.formState.errors.description.message}
              </Field.Error>
            )}
          </Field.Container>

          <Field.Container>
            <Field.Label>Due Date</Field.Label>
            <Field.Input {...form.register('dueDate')} type="date" />
            {form.formState.errors.dueDate && (
              <Field.Error>{form.formState.errors.dueDate.message}</Field.Error>
            )}
          </Field.Container>

          <Field.Container>
            <Field.Label>Column *</Field.Label>
            <SelectComponent.Root
              value={form.control._formValues.columnId}
              onValueChange={value => form.setValue('columnId', value)}
            >
              <SelectComponent.Trigger>
                <SelectComponent.Value placeholder="Select a column" />
              </SelectComponent.Trigger>
              <SelectComponent.Content>
                <SelectComponent.Group>
                  {columnOptions.map(option => (
                    <SelectComponent.Item
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectComponent.Item>
                  ))}
                </SelectComponent.Group>
              </SelectComponent.Content>
            </SelectComponent.Root>
            {form.formState.errors.columnId && (
              <Field.Error>
                {form.formState.errors.columnId.message}
              </Field.Error>
            )}
          </Field.Container>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <Clickable.Button type="button" onClick={onCancel} variant="outline">
            Cancel
          </Clickable.Button>
          <Clickable.Button type="submit">
            {isEditMode ? 'Update Task' : 'Create Task'}
          </Clickable.Button>
        </div>
      </form>
    </Dialog.Content>
  );
}
