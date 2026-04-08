# Quickstart: Modal Store

**Created**: 2025-04-08  
**Purpose**: Quick guide for using the Modal Store

## Usage

### Import the Types

```typescript
import type { Renderable } from '@/types/helpers';
```

### Import the Store

```typescript
import { modalStore } from '@/store/modal';
```

### Basic Modal Operations

```typescript
// Open a modal
modalStore.modal = "user-profile-modal";

// Close modal
modalStore.modal = null;

// Check if modal is open
const isOpen = modalStore.modal !== null;
console.log("Modal is open:", isOpen);

// Get current modal
const currentModal = modalStore.modal;
console.log("Current modal:", currentModal);
```

### Using Renderable Type

```typescript
// Function component
const modalContent: Renderable<{ title: string }> = (props) => (
  <div>
    <h1>{props.title}</h1>
    <p>Modal content</p>
  </div>
);

// React element
const element: Renderable = <div>Simple modal content</div>;
```

## File Structure

```
src/
|-- types/
|   `-- helpers.ts          # Renderable type
|-- store/
|   `-- modal/
|       `-- index.ts         # modalStore proxy object
```

## Implementation Notes

- Uses valtio proxy for reactive state management
- Simple state structure with single modal property
- Global singleton pattern for application-wide access
- No computed properties needed for basic modal management

## Best Practices

- Use type imports for Renderable type
- Set modal to null to close
- Check modal !== null to determine if open
- Only one modal can be open at a time
- Store is reactive - components will update automatically
