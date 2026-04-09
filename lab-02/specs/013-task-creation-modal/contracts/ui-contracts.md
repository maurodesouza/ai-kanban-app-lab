# UI Contracts: Task Creation Modal

**Date**: 2026-04-09  
**Purpose**: Define interface contracts for task modal component

## Component Interface Contract

### TaskModal Component

```typescript
interface TaskModalProps {
  kanbanId: string;        // Required: Kanban board identifier
  task?: KankanTask;       // Optional: Task data for edit mode
}

interface TaskModalComponent {
  (props: TaskModalProps): React.ReactElement;
}
```

### Form Data Contract

```typescript
interface TaskFormValues {
  title: string;           // Required: 1-100 characters
  description?: string;    // Optional: 0-500 characters  
  dueDate?: string;        // Optional: Valid datetime string
  columnId: string;        // Required: Valid column ID from kanban
}
```

### Event Contract Integration

The modal component integrates with existing event contracts:

#### Modal Events
- `events.modal.show(Renderable)` - Opens modal with TaskModal component
- `events.modal.hide()` - Closes modal after submission or cancellation

#### Kanban Events  
- `events.kanban.addTask(AddTaskEventPayload)` - Creates new task
- `events.kanban.editTask(EditTaskEventPayload)` - Updates existing task

## Validation Contract

### Schema Rules
- Title: Required, 1-100 characters
- Description: Optional, max 500 characters  
- Due Date: Optional, must be future datetime
- Column ID: Required, must exist in kanban store

### Error Display Contract
- Validation errors displayed inline with form fields
- Error messages user-friendly and actionable
- Form submission prevented with invalid data

## State Management Contract

### Kanban Store Integration
- Modal reads column options from kanban store by ID
- Modal emits events that update kanban store through handlers
- No direct store manipulation - event-driven only

### Form State Contract
- Form managed by react-hook-form
- Validation state tracked and displayed
- Default values set based on mode (create/edit)

## UI Component Contracts

### Dialog Component Integration
- Uses Dialog.Content, Dialog.Header, Dialog.Title, Dialog.Body, Dialog.Footer
- No Dialog.Root - modal rendered through event system
- Follows existing dialog styling and behavior

### Field Component Integration  
- Uses Field.Container, Field.Label, Field.Input, Field.Textarea, Field.Select, Field.Error
- Maintains consistent styling with other forms
- Handles validation state display

### Clickable Component Integration
- Uses Clickable.Button for form actions
- Supports different variants (primary/secondary)
- Consistent with other button usage

## Data Flow Contract

1. **Modal Initialization**
   - Props: kanbanId (required), task (optional for edit mode)
   - Fetch kanban store for column options
   - Set form default values

2. **Form Interaction**
   - Real-time validation using Zod schema
   - Error display and prevention of invalid submission
   - User can cancel at any time

3. **Form Submission**
   - Validate all form data
   - Create task data object
   - Emit appropriate event (addTask/editTask)
   - Close modal

## Error Handling Contract

### Expected Errors
- Kanban store not found: Log error, close modal
- Invalid column ID: Display validation error
- Form validation errors: Display inline, prevent submission

### Error Recovery
- User can correct validation errors and resubmit
- Modal remains open for error correction
- Cancel option always available
