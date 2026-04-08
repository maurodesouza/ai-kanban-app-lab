# Quickstart: Kanban Events

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the Kanban Events

## Usage

### Import the Kanban Events

```typescript
import { KanbanHandleEvents } from '@/events/handles/kanban';
```

### Basic Kanban Event Operations

```typescript
// Create kanban event handler
const kanbanEvents = new KanbanHandleEvents();

// Add a task
kanbanEvents.addTask({
  id: 'task-1',
  title: 'New Task',
  description: 'Task description',
  status: 'todo',
  // ... other task properties
});

// Edit a task
kanbanEvents.editTask({
  id: 'task-1',
  title: 'Updated Task',
  // ... updated task properties
});

// Delete a task
kanbanEvents.deleteTask('task-1');

// Apply filter
kanbanEvents.filter({
  status: 'in-progress',
  assignee: 'user-1'
});

// Reorder tasks
kanbanEvents.reorder({
  taskId: 'task-1',
  fromColumn: 'todo',
  toColumn: 'in-progress',
  fromIndex: 0,
  toIndex: 1
});
```

### Event Subscription

```typescript
import { events } from '@/events';

// Subscribe to task events
events.on('kanban.task.add', (event) => {
  console.log('Task added:', event.detail);
});

events.on('kanban.task.edit', (event) => {
  console.log('Task edited:', event.detail);
});

events.on('kanban.task.delete', (event) => {
  console.log('Task deleted:', event.detail);
});

// Subscribe to filter events
events.on('kanban.filter', (event) => {
  console.log('Filter applied:', event.detail);
});

// Subscribe to reorder events
events.on('kanban.reorder', (event) => {
  console.log('Tasks reordered:', event.detail);
});
```

## File Structure

```
src/
|-- events/
|   |-- handles/
|   |   |-- base.ts          # BaseEventHandle (existing)
|   |   |-- modal.ts         # ModalHandleEvents (existing)
|   |   `-- kanban.ts        # KanbanHandleEvents
|   |-- index.ts             # Events bus
|   `-- types/
|       `-- events.ts        # Event definitions
|-- types/
|   |-- kanban.ts            # Kanban types (existing)
|   `-- events.ts            # Event type definitions
```

## Implementation Notes

- Uses CustomEvent API for event emission
- Extends BaseEventHandle class
- Follows existing event architecture pattern
- Simple event emission without complex state management
- Integrates with existing kanban types

## Best Practices

- Import KanbanHandleEvents class for event emission
- Use events.on() for event subscription
- Clean up event listeners when components unmount
- Follow existing event naming conventions
- Use existing kanban types for event payloads
