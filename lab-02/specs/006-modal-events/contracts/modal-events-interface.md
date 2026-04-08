# Modal Events Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for modal events

## Export Interface

The modal events package exports ModalHandleEvents for modal event management:

### ModalHandleEvents

**Description**: Event emitter class for modal open/close events  
**Methods**:
- show(args: ShowModalArgs): Emit modal.show event
- hide(): Emit modal.hide event

### ShowModalArgs

**Description**: Payload structure for modal.show events  
**Properties**:
- modal: Renderable | null - Modal content to display

## Import Contract

```typescript
import { ModalHandleEvents } from '@/events/handles/modal';
```

## Usage Contract

```typescript
// Create modal event handler
const modalEvents = new ModalHandleEvents();

// Open a modal
modalEvents.show({ modal: modalContent });

// Close modal
modalEvents.hide();
```

## Implementation Constraints

- Must extend BaseEventHandle class
- Must follow existing event architecture pattern
- Must use CustomEvent API for event emission
- Must emit modal.show and modal.hide events
- No additional methods or properties allowed
- Must be exported from src/events/handles/modal.ts
