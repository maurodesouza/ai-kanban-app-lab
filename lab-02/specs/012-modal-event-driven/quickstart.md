# Quickstart: Event-Driven Modal System

## Implementation Overview

This feature creates an event-driven modal system that can be triggered from anywhere in the application. The implementation involves creating a modal molecule component, a flexible render helper, and event handlers for global modal control.

## Step-by-Step Implementation

### 1. Create FlexibleRender Helper Component

**File**: `src/components/helpers/flexible-render/index.tsx`

```tsx
'use client';

import { Renderable } from '@/types/helpers';

interface FlexibleRenderProps {
  render: Renderable;
}

export function FlexibleRender({ render }: FlexibleRenderProps) {
  if (typeof render === 'string') {
    return <span>{render}</span>;
  }
  
  if (typeof render === 'function') {
    const Component = render;
    return <Component />;
  }
  
  return render;
}

export const FlexibleRenderComponent = FlexibleRender;
```

### 2. Create Modal Event Handles

**File**: `src/events/handles/modal.ts`

```tsx
import { BaseEventHandle } from './base';
import { Events } from '@/types/events';
import { modalStore } from '@/store/modal';

interface ShowModalArgs {
  content: any; // Renderable type
  config?: {
    title?: string;
    size?: 'sm' | 'md' | 'lg';
  };
}

class ModalHandleEvents extends BaseEventHandle {
  show(args: ShowModalArgs) {
    this.emit(Events.MODAL_SHOW, args);
  }

  hide() {
    this.emit(Events.MODAL_HIDE);
  }
}

export { ModalHandleEvents };
```

### 3. Create Modal Molecule Component

**File**: `src/components/molecules/modal/index.tsx`

```tsx
'use client';

import { useSnapshot } from 'valtio';
import { modalStore } from '@/store/modal';
import { Dialog } from '@/components/atoms/dialog';
import { FlexibleRender } from '@/components/helpers/flexible-render';
import { events } from '@/events';

export function Modal() {
  const modalState = useSnapshot(modalStore);

  function onShowModal(event: CustomEvent) {
    modalStore.content = event.detail.content;
    modalStore.isVisible = true;
  }

  function onHideModal() {
    modalStore.isVisible = false;
    modalStore.content = null;
  }

  // Event listeners
  useEffect(() => {
    events.on('modal.show', onShowModal);
    events.on('modal.hide', onHideModal);

    return () => {
      events.off('modal.show', onShowModal);
      events.off('modal.hide', onHideModal);
    };
  }, []);

  if (!modalState.isVisible) {
    return null;
  }

  return (
    <Dialog.Root open={modalState.isVisible}>
      <Dialog.Portal>
        <Dialog.Overlay />
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Modal</Dialog.Title>
            <Dialog.Close onClick={() => events.modal.hide()} />
          </Dialog.Header>
          <Dialog.Body>
            <FlexibleRender render={modalState.content} />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const ModalComponent = Modal;
```

### 4. Mount Modal in Root Layout

**File**: `src/app/layout.tsx`

```tsx
import { Modal } from '@/components/molecules/modal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Modal />
        {children}
      </body>
    </html>
  );
}
```

### 5. Update Event Types

**File**: `src/types/events.ts`

```tsx
export enum Events {
  MODAL_SHOW = 'modal.show',
  MODAL_HIDE = 'modal.hide',
}
```

### 6. Update Modal Store

**File**: `src/store/modal/index.ts`

```tsx
import { proxy } from 'valtio';

export interface ModalState {
  isVisible: boolean;
  content: any; // Renderable type
  config?: {
    title?: string;
    size?: 'sm' | 'md' | 'lg';
  };
}

export const modalStore = proxy<ModalState>({
  isVisible: false,
  content: null,
  config: {},
});
```

## Usage Examples

### Opening Modal from Any Component

```tsx
import { events } from '@/events';

function SomeComponent() {
  const openModal = () => {
    events.modal.show({
      content: 'Hello from modal!',
      config: { title: 'Notification' }
    });
  };

  return <button onClick={openModal}>Open Modal</button>;
}
```

### Opening Modal with React Component

```tsx
import { events } from '@/events';

function ModalContent() {
  return <div>Custom modal content</div>;
}

function SomeComponent() {
  const openModal = () => {
    events.modal.show({
      content: ModalContent,
      config: { title: 'Custom Modal' }
    });
  };

  return <button onClick={openModal}>Open Custom Modal</button>;
}
```

## Key Implementation Notes

### Event-Driven Architecture
- Modal can be triggered from anywhere using events
- No direct component coupling required
- Global state management through Valtio

### Component Structure
- Modal molecule uses existing dialog atom
- FlexibleRender helper handles dynamic content
- Clean separation of concerns

### State Management
- Modal store handles visibility and content
- Event handlers update store state
- Reactive updates trigger re-rendering

## Validation

**Success Criteria**:
- [ ] Modal appears when modal.show event is emitted
- [ ] Modal content renders correctly for different payload types
- [ ] Modal closes when modal.hide event is emitted
- [ ] Modal can be triggered from any component
- [ ] Modal appears within 100ms of event emission

**Testing Approach**:
- Event emission from different components
- Content rendering validation
- State management verification
- Performance timing measurement
