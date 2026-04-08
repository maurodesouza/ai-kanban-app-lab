# Data Model: Modal Store

**Created**: 2025-04-08  
**Purpose**: Define data structures and entities for modal store

## Key Entities

### Renderable Type

**Description**: Utility type for modal content rendering  
**Definition**: Union type of render functions and React elements  
**Usage**: Type definition for modal content components

### ModalStoreState

**Description**: State structure for modal management  
**Attributes**:
- modal: Currently open modal (null when no modal is open)

### Modal Store

**Description**: Valtio proxy object for reactive modal state management  
**Features**:
- Reactive state updates
- Global accessibility
- Simple modal tracking

## Data Flow

1. **Import**: Components import modalStore and Renderable type
2. **Open Modal**: Set modal property to modal identifier/content
3. **Close Modal**: Set modal property to null
4. **State Updates**: Valtio proxy automatically triggers reactivity

## Validation Rules

- Modal property can be null or modal identifier
- Only one modal can be open at a time (enforced by single property)
- State updates are reactive through valtio proxy

## State Management

- Uses valtio proxy for reactive state management
- No computed properties needed (simple state)
- Direct property access for modal state
- Global singleton pattern
