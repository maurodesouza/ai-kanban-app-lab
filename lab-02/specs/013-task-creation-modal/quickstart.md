# Quickstart: Task Creation Modal

**Purpose**: Implementation guide for task creation/editing modal component  
**Date**: 2026-04-09

## Prerequisites

Ensure these dependencies are available:
- react-hook-form (form management)
- @hookform/resolvers (validation integration)
- zod (schema validation)
- Existing kanban stores and event system

## Implementation Steps

### 1. Create Modal Component Structure

```bash
# Create component directory
mkdir -p src/components/molecules/task-modal
```

### 2. Create Zod Validation Schema

Create `src/components/molecules/task-modal/schema.ts`:

```typescript
import { z } from 'zod';

export const taskFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  dueDate: z.string()
    .datetime('Invalid date format')
    .refine(date => new Date(date) > new Date(), 'Due date must be in the future')
    .optional(),
  columnId: z.string()
    .min(1, 'Column is required')
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
```

### 3. Create Main Modal Component

Create `src/components/molecules/task-modal/index.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSnapshot } from 'valtio';
import { useEffect } from 'react';

import { taskFormSchema, TaskFormValues } from './schema';
import { Dialog } from '@/components/atoms/dialog';
import { Clickable } from '@/components/atoms/clickable';
import { Field } from '@/components/atoms/field';
import { events } from '@/events';
import { kanbanStores } from '@/stores/kanban';
import type { KankanTask } from '@/types/kanban';

interface TaskModalProps {
  kanbanId: string;
  task?: KankanTask;
}

export function TaskModal({ kanbanId, task }: TaskModalProps) {
  const kanbanStore = kanbanStores.get(kanbanId);
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      dueDate: task?.dueDate || '',
      columnId: task?.columnId || ''
    }
  });

  useEffect(() => {
    if (kanbanStore && !task) {
      // Set default column for new tasks
      const firstColumn = Object.values(kanbanStore.columns)[0];
      if (firstColumn) {
        form.setValue('columnId', firstColumn.id);
      }
    }
  }, [kanbanStore, task, form]);

  const onSubmit = (data: TaskFormValues) => {
    if (!kanbanStore) return;

    const taskData = {
      ...data,
      kanbanId,
      id: task?.id || `task-${Date.now()}`,
      createdAt: task?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (task) {
      // Edit mode
      events.kanban.editTask({
        id: kanbanId,
        data: taskData
      });
    } else {
      // Create mode
      events.kanban.addTask({
        id: kanbanId,
        data: taskData
      });
    }

    events.modal.hide();
  };

  const onCancel = () => {
    events.modal.hide();
  };

  if (!kanbanStore) {
    return null;
  }

  const columnOptions = Object.values(kanbanStore.columns).map(column => ({
    value: column.id,
    label: column.title
  }));

  const isEditMode = !!task;

  return (
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>
          {isEditMode ? 'Edit Task' : 'Create Task'}
        </Dialog.Title>
      </Dialog.Header>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Dialog.Body>
          <Field.Container>
            <Field.Label>Title *</Field.Label>
            <Field.Input
              {...form.register('title')}
              placeholder="Enter task title"
            />
            {form.formState.errors.title && (
              <Field.Error>
                {form.formState.errors.title.message}
              </Field.Error>
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
            <Field.Input
              {...form.register('dueDate')}
              type="date"
            />
            {form.formState.errors.dueDate && (
              <Field.Error>
                {form.formState.errors.dueDate.message}
              </Field.Error>
            )}
          </Field.Container>

          <Field.Container>
            <Field.Label>Column *</Field.Label>
            <Field.Select {...form.register('columnId')}>
              {columnOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Field.Select>
            {form.formState.errors.columnId && (
              <Field.Error>
                {form.formState.errors.columnId.message}
              </Field.Error>
            )}
          </Field.Container>
        </Dialog.Body>

        <Dialog.Footer>
          <Clickable.Button
            type="button"
            onClick={onCancel}
            variant="secondary"
          >
            Cancel
          </Clickable.Button>
          <Clickable.Button type="submit">
            {isEditMode ? 'Update Task' : 'Create Task'}
          </Clickable.Button>
        </Dialog.Footer>
      </form>
    </Dialog.Content>
  );
}
```

### 4. Usage Examples

#### Create Task Mode

```typescript
// Open modal for creating new task
function openCreateTaskModal(kanbanId: string) {
  events.modal.show(
    <TaskModal kanbanId={kanbanId} />
  );
}
```

#### Edit Task Mode

```typescript
// Open modal for editing existing task
function openEditTaskModal(kanbanId: string, task: KankanTask) {
  events.modal.show(
    <TaskModal kanbanId={kanbanId} task={task} />
  );
}
```

### 5. Integration Points

The modal integrates with:
- **Event System**: Uses `events.modal.show/hide` and `events.kanban.addTask/editTask`
- **Kanban Stores**: Fetches column options from kanban store by ID
- **Form Validation**: React Hook Form with Zod schema
- **UI Components**: Dialog, Field, Clickable atoms

### 6. Testing Notes

- Test form validation with empty title and invalid dates
- Test column selection with different kanban boards
- Test both create and edit modes
- Verify modal closes after successful submission
- Verify events are emitted correctly

## Dependencies Required

Add these packages if not already installed:

```bash
npm install react-hook-form @hookform/resolvers zod
```

## Next Steps

1. Create the component files as outlined
2. Test modal integration with existing kanban system
3. Verify form validation and error handling
4. Test both create and edit workflows
5. Ensure modal styling matches design system
