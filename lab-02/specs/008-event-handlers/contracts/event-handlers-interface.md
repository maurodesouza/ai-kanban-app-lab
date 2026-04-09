# Event Handlers Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for event handler components

## Export Interface

The event handlers package exports React components for modal and kanban event handling:

### ModalHandler Component

**Description**: React component that subscribes to modal events and manages modal state  
**Features**:
- Subscribes to modal.show and modal.hide events
- Updates modal store when events are received
- Cleans up event subscriptions on unmount
- Skeleton implementation with no business logic

### KanbanHandler Component

**Description**: React component that subscribes to kanban events and manages kanban state  
**Features**:
- Subscribes to kanban.task.add, kanban.task.edit, kanban.task.delete events
- Updates kanban store when events are received
- Cleans up event subscriptions on unmount
- Skeleton implementation with no business logic

## Import Contract

```typescript
import { ModalHandler } from '@/components/handles/modal';
import { KanbanHandler } from '@/components/handles/kanban';
```

## Usage Contract

```typescript
// In application root or layout
<ModalHandler />
<KanbanHandler />
```

## Implementation Constraints

- Must be React functional components
- Must use useEffect for event subscription lifecycle
- Must follow existing event architecture pattern
- Must use events.on() and events.off() for subscription management
- Must integrate with existing modal and kanban stores
- Must be skeleton implementations with no business logic
- Must be exported from src/components/handles/modal.tsx and src/components/handles/kanban.tsx
- Must properly clean up event subscriptions on component unmount
