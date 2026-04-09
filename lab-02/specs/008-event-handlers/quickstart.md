# Quickstart: Event Handlers

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the Event Handlers

## Usage

### Import the Event Handlers

```typescript
import { ModalHandler } from '@/components/handles/modal';
import { KanbanHandler } from '@/components/handles/kanban';
```

### Basic Event Handler Usage

```typescript
// In application root or layout component
function App() {
  return (
    <div>
      <ModalHandler />
      <KanbanHandler />
      {/* Other app content */}
    </div>
  );
}
```

### Event Subscription Pattern

```typescript
// ModalHandler component skeleton
function ModalHandler() {
  useEffect(() => {
    // Subscribe to modal events
    events.on('modal.show', handleModalShow);
    events.on('modal.hide', handleModalHide);

    // Cleanup on unmount
    return () => {
      events.off('modal.show', handleModalShow);
      events.off('modal.hide', handleModalHide);
    };
  }, []);

  return null; // Handler components are typically invisible
}

// KanbanHandler component skeleton
function KanbanHandler() {
  useEffect(() => {
    // Subscribe to kanban events
    events.on('kanban.task.add', handleTaskAdd);
    events.on('kanban.task.edit', handleTaskEdit);
    events.on('kanban.task.delete', handleTaskDelete);

    // Cleanup on unmount
    return () => {
      events.off('kanban.task.add', handleTaskAdd);
      events.off('kanban.task.edit', handleTaskEdit);
      events.off('kanban.task.delete', handleTaskDelete);
    };
  }, []);

  return null; // Handler components are typically invisible
}
```

## File Structure

```
src/
|-- components/
|   |-- handles/
|   |   |-- modal.tsx          # ModalHandler component
|   |   `-- kanban.tsx         # KanbanHandler component
|-- events/
|   |-- handles/
|   |   |-- modal.ts           # ModalHandleEvents (existing)
|   |   `-- kanban.ts          # KanbanHandleEvents (existing)
|   `-- index.ts               # Events bus (existing)
|-- stores/
|   |-- modal/                  # Modal store (existing)
|   `-- kanban/                 # Kanban store (existing)
```

## Implementation Notes

- Uses React functional components with useEffect for lifecycle management
- Follows existing event architecture pattern for subscription management
- Integrates with existing modal and kanban stores for state updates
- Skeleton implementation - no business logic included
- Components are typically invisible and mounted in application root

## Best Practices

- Import handler components in application root or layout
- Use useEffect for event subscription lifecycle management
- Always clean up event subscriptions in useEffect cleanup function
- Follow existing event architecture pattern for event names and payload structure
- Use existing stores for state management updates
- Keep handler components as skeleton implementations with minimal logic
