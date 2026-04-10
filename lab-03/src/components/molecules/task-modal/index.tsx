'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog } from '@/components/molecules/dialog';
import { Field } from '@/components/molecules/field';
import { SelectField } from '@/components/molecules/select';
import { Clickable } from '@/components/atoms/clickable';
import { events } from '@/events';
import { kanbanStore } from '@/stores/kanban';
import type { Task } from '@/types/kanban';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  columnId: z.string().min(1, 'Column is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

type TaskModalProps = {
  storeId: string;
  task?: Task;
  columnId?: string;
};

function TaskModal({
  storeId,
  task,
  columnId: defaultColumnId,
}: TaskModalProps) {
  const store = kanbanStore.getById(storeId);
  const isEditing = !!task;

  // Get first column ID as default for new tasks
  const firstColumnId = store ? Object.keys(store.columns)[0] : '';

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || '',
      columnId: task?.columnId || defaultColumnId || firstColumnId || '',
    },
  });

  function onSubmit(data: TaskFormData) {
    if (isEditing && task) {
      // Update existing task
      events.kanban.updateTask({
        storeId,
        taskId: task.id,
        data: {
          title: data.title,
          description: data.description,
          dueDate: data.dueDate,
          columnId: data.columnId,
        },
      });
    } else {
      // Create new task
      events.kanban.createTask({
        storeId,
        data: {
          ...data,
          kanbanId: storeId,
          description: data.description || '',
          dueDate: data.dueDate || '',
        },
      });
    }

    // Close modal
    events.modal.hide();
  }

  const columns = store ? Object.values(store.columns) : [];

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>{isEditing ? 'Edit Task' : 'Create Task'}</Dialog.Title>
        <Dialog.Description>
          {isEditing
            ? 'Edit the task details below. Update the title, description, due date, or column.'
            : 'Create a new task by filling in the details below. All required fields must be completed.'}
        </Dialog.Description>
      </Dialog.Header>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Field.Container>
          <Field.Label>Title *</Field.Label>
          <Field.Input
            {...form.register('title')}
            placeholder="Enter task title"
            tone={form.formState.errors.title ? 'danger' : 'brand'}
          />
          {form.formState.errors.title && (
            <Field.Error>{form.formState.errors.title.message}</Field.Error>
          )}
        </Field.Container>

        <Field.Container>
          <Field.Label>Description</Field.Label>
          <Field.TextArea
            {...form.register('description')}
            placeholder="Enter task description"
            tone="brand"
          />
        </Field.Container>

        <Field.Container>
          <Field.Label>Due Date</Field.Label>
          <Field.Input
            {...form.register('dueDate')}
            type="date"
            tone={form.formState.errors.dueDate ? 'danger' : 'brand'}
          />
          {form.formState.errors.dueDate && (
            <Field.Error>{form.formState.errors.dueDate.message}</Field.Error>
          )}
        </Field.Container>

        <Field.Container>
          <Field.Label>Column *</Field.Label>
          <Controller
            name="columnId"
            control={form.control}
            render={({ field }) => (
              <SelectField.Root
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectField.Trigger
                  tone={form.formState.errors.columnId ? 'danger' : 'brand'}
                >
                  <SelectField.Value placeholder="Select a column" />
                </SelectField.Trigger>
                <SelectField.Content>
                  {columns.map(column => (
                    <SelectField.Item key={column.id} value={column.id}>
                      {column.title}
                    </SelectField.Item>
                  ))}
                </SelectField.Content>
              </SelectField.Root>
            )}
          />
          {form.formState.errors.columnId && (
            <Field.Error>{form.formState.errors.columnId.message}</Field.Error>
          )}
        </Field.Container>

        <Dialog.Footer>
          <Clickable.Button type="button" onClick={() => events.modal.hide()}>
            Cancel
          </Clickable.Button>
          <Clickable.Button tone="brand" type="submit">
            {isEditing ? 'Update Task' : 'Create Task'}
          </Clickable.Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
}

export { TaskModal };
