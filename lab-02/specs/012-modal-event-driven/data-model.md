# Data Model: Event-Driven Modal System

## Existing Data Structures

This feature leverages existing data structures from the project. No new data models are required.

### Reused Entities

#### Modal Store
- **Source**: `src/store/modal/index.ts`
- **Structure**: Valtio proxy with modal state (visibility, content, configuration)
- **Usage**: Central state management for modal visibility and content

#### Renderable Type
- **Source**: `src/types/helpers.ts`
- **Structure**: Type definition for flexible content rendering
- **Usage**: Type for modal content payload in events

#### Dialog Provider
- **Source**: `src/components/atoms/dialog/index.tsx`
- **Structure**: Radix UI dialog with provider pattern
- **Usage**: Base modal UI component with accessibility features

## Event System Data

### Modal Events

#### Modal Show Event
- **Type**: `modal.show`
- **Payload**: `{ content: Renderable, config?: ModalConfig }`
- **Action**: Updates modal store with content and sets visibility to true

#### Modal Hide Event
- **Type**: `modal.hide`
- **Payload**: `{}` (empty)
- **Action**: Sets modal visibility to false

## Data Flow

1. **Event Emission**: Component emits modal.show event with content
2. **Event Handling**: Modal event handle updates store state
3. **State Reactivity**: Modal component reacts to store changes
4. **Content Rendering**: FlexibleRender renders store content
5. **Modal Display**: Dialog provider shows modal with rendered content

## State Management

- **Store**: Modal store manages visibility and content state
- **Events**: Event system updates store without direct component coupling
- **Reactivity**: Valtio provides automatic reactivity for state changes
- **Persistence**: Client-side only (no backend integration required)

## Validation Rules

No new validation rules required. Existing type system provides validation:
- Content must be of type Renderable
- Events must follow defined event structure
- Store updates must maintain state consistency
