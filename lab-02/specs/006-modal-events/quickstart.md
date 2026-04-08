# Quickstart: Modal Events

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the Modal Events

## Usage

### Import the Modal Events

```typescript
import { ModalHandleEvents } from '@/events/handles/modal';
```

### Basic Modal Event Operations

```typescript
// Create modal event handler
const modalEvents = new ModalHandleEvents();

// Open a modal
modalEvents.show({ modal: <div>Modal Content</div> });

// Close modal
modalEvents.hide();
```

### Event Subscription

```typescript
import { events } from '@/events';

// Subscribe to modal events
events.on('modal.show', (event) => {
  console.log('Modal opened:', event.detail.modal);
});

events.on('modal.hide', () => {
  console.log('Modal closed');
});
```

## File Structure

```
src/
|-- events/
|   |-- handles/
|   |   |-- base.ts          # BaseEventHandle (existing)
|   |   `-- modal.ts         # ModalHandleEvents
|   |-- index.ts             # Events bus
|   `-- types/
|       `-- events.ts        # Event definitions
```

## Implementation Notes

- Uses CustomEvent API for event emission
- Extends BaseEventHandle class
- Follows existing event architecture pattern
- Simple event emission without complex state management
- Modal events are synchronous for basic implementation

## Best Practices

- Import ModalHandleEvents class for event emission
- Use events.on() for event subscription
- Clean up event listeners when components unmount
- Follow existing event naming conventions
- Use modal.show for opening, modal.hide for closing
