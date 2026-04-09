# Data Model: Task Creation Modal

**Date**: 2026-04-09  
**Purpose**: Define data structures and validation rules for task creation modal

## Task Modal Form Data

```typescript
interface TaskModalFormData {
  title: string;           // Required: Task title
  description?: string;    // Optional: Task description  
  dueDate?: string;        // Optional: Due date (ISO string)
  columnId: string;        // Required: Target column ID
}
```

## Task Modal Props

```typescript
interface TaskModalProps {
  kanbanId: string;        // Required: Kanban board ID
  task?: KankanTask;       // Optional: Task data for edit mode
}
```

## Validation Schema (Zod)

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

## Modal Mode Detection

```typescript
type ModalMode = 'create' | 'edit';

function getModalMode(task?: KankanTask): ModalMode {
  return task ? 'edit' : 'create';
}
```

## Form Default Values

```typescript
function getDefaultValues(task?: KankanTask, firstColumnId?: string): TaskFormValues {
  return {
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate || '',
    columnId: task?.columnId || firstColumnId || ''
  };
}
```

## Column Selection Data

```typescript
interface ColumnOption {
  id: string;
  title: string;
}

function getColumnOptions(kanbanStore: KanbanStoreState): ColumnOption[] {
  return Object.values(kanbanStore.columns).map(column => ({
    id: column.id,
    title: column.title
  }));
}
```

## Form Submission Data

```typescript
interface TaskSubmissionData extends TaskModalFormData {
  kanbanId: string;
  id?: string;  // For edit mode
}
```

## Event Payload Types

```typescript
// For create mode
interface CreateTaskEventPayload {
  id: string;
  data: Omit<KankanTask, 'id' | 'createdAt' | 'updatedAt'>;
}

// For edit mode  
interface EditTaskEventPayload {
  id: string;
  data: Partial<KankanTask>;
}
```

## Data Flow

1. **Modal Open**: 
   - Receive kanbanId and optional task
   - Fetch kanban store to get column options
   - Set default values based on mode (create/edit)

2. **Form Validation**:
   - Real-time validation using Zod schema
   - Display validation errors for required fields
   - Prevent submission with invalid data

3. **Form Submission**:
   - Create mode: Emit events.kanban.addTask
   - Edit mode: Emit events.kanban.editTask
   - Close modal using events.modal.hide

## State Transitions

```
Modal Closed
    |
    v
Modal Opened (create/edit mode)
    |
    v
Form Validation (real-time)
    |
    v
Form Submission (if valid)
    |
    v
Event Emitted (addTask/editTask)
    |
    v
Modal Closed
```

## Error Handling

- **Validation Errors**: Display inline with form fields
- **Store Not Found**: Log error and close modal
- **Column Not Found**: Log error and keep modal open
- **Submission Failure**: Keep modal open and display error

## Integration Points

- **Kanban Store**: Column options and task data
- **Event System**: Modal visibility and task operations
- **Form Library**: React Hook Form with Zod resolver
- **UI Components**: Dialog, Field, Clickable atoms
