# Modal Store Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for modal store

## Export Interface

The modal store package exports a modalStore proxy object:

### modalStore

**Description**: Valtio proxy object for global modal state management  
**Type**: ModalStoreState proxy  
**State Structure**:
- modal: Currently open modal (null when closed)

## Import Contract

```typescript
import { modalStore } from '@/store/modal';
```

## Usage Contract

```typescript
// Access modal state
console.log(modalStore.modal); // Current open modal or null

// Open a modal
modalStore.modal = "user-profile-modal";

// Close modal
modalStore.modal = null;

// Check if modal is open
const isOpen = modalStore.modal !== null;
```

## Implementation Constraints

- Must use valtio proxy for state management
- Must follow user-provided exact structure: "export const modalStore = proxy<ModalStoreState>({ modal: null })"
- No additional methods or properties allowed
- Must be exported from src/store/modal/index.ts
- Simple state structure with single modal property
