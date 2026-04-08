# Renderable Type Interface Contract

**Created**: 2025-04-08  
**Purpose**: Define the public interface for Renderable type

## Export Interface

The helpers package exports a Renderable type for modal content:

### Renderable<T = unknown>

**Description**: Union type for modal content rendering  
**Definition**: Function or React element that can be rendered  
**Generic Parameter**: T - Optional props type for render functions

## Import Contract

```typescript
import type { Renderable } from '@/types/helpers';
```

## Usage Contract

```typescript
// Type definitions for modal content
const modalContent: Renderable<{ title: string }> = (props) => (
  <div>{props.title}</div>
);

// React element usage
const element: Renderable = <div>Modal Content</div>;
```

## Implementation Constraints

- Type must be exported from src/types/helpers.ts
- Must follow user-provided exact type definition
- No additional properties or methods allowed
- Must support both function and React.Element types
