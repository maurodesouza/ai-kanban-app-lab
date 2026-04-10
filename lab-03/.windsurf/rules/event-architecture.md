---
trigger: always_on
description: Use this rule when implementing event-driven architecture in the application.
---

# Event Architecture Rule

## Overview

This project uses an **event-based pub/sub pattern** to decouple UI from state logic. The system is agnostic regarding the state manager (Zustand, Valtio, etc.). 

## Rule Scope

This is the official and only allowed pattern for event-driven communication in the project.

### Key Components

1. **Event Emitters** (`/src/events/handles/`)
2. **Event Definitions** (`/src/types/events.ts`)
3. **Event Handlers** (`/src/components/handlers/`)
4. **Event Bus** (`/src/events/index.ts`)

---

## Base Event Handle

```typescript
// /src/events/handles/base.ts
import { config } from 'config';
import { Events } from '@types/events';

class BaseEventHandle {
  protected emit(event: Events, payload?: unknown) {
    const isDev = config.envs.environment === 'development';

    if (isDev) {
      console.info(`events[emit]: ${event}`, payload);
    }

    const customEvent = new CustomEvent(event, { detail: payload });
    document.dispatchEvent(customEvent);
  }
}

export { BaseEventHandle };
```

---

## Event Bus

```typescript
// /src/events/index.ts
import { Events } from '@types/events';
import { Handles } from './handles';

type Callback = (args: any) => void;
type Event = Events | keyof DocumentEventMap;

class EventsHandle extends Handles {
  on(event: Event, callback: Callback) {
    document.addEventListener(event, callback);
  }

  off(event: Event, callback: Callback) {
    document.removeEventListener(event, callback);
  }
}

const events = new EventsHandle();

export { events };
```

---

## 1. Defining Events

```typescript
// /src/types/events.ts
export enum Events {
  MODAL_SHOW = 'modal.show',
  MODAL_HIDE = 'modal.hide',
}
```

---

## 2. Creating Event Emitter

```typescript
// /src/events/handles/modal.ts
import { Events } from '@types/events';
import { BaseEventHandle } from './base';

type ShowModalArgs = {
  modal: string;
};

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

---

## 3. Register Handles

```typescript
// /src/events/handles/index.ts
import { ModalHandleEvents } from './modal';

class Handles {
  modal = new ModalHandleEvents();
}

export { Handles };
```

---

## 4. Handler (Modal)

```typescript
// /src/components/handlers/modal.ts
import { useEffect } from 'react';
import { events } from '@events';
import { Events } from '@types/events';
import { modalStore } from '@/stores/modal';

type ModalPayload = {
  modal: string;
};

function ModalHandler() {
  function onShowModal(event: CustomEvent<ModalPayload>) {
    modalStore.set({
      modal: event.detail.modal,
    });
  }

  function onHideModal() {
    modalStore.set({
      modal: null,
    });
  }

  useEffect(() => {
    events.on(Events.MODAL_SHOW, onShowModal);
    events.on(Events.MODAL_HIDE, onHideModal);

    return () => {
      events.off(Events.MODAL_SHOW, onShowModal);
      events.off(Events.MODAL_HIDE, onHideModal);
    };
  }, []);

  return null;
}

export { ModalHandler };
```

---

## 5. Mounting the Handler (Next.js)

```tsx
// /src/app/layout.tsx
import { ModalHandler } from '@/components/handlers/modal';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ModalHandler />
        {children}
      </body>
    </html>
  );
}
```

## 6. Emitting Events

```typescript
import { events } from '@events';

function OpenModalButton() {
  function onClick() {
    events.modal.show(() => <React.Node />);
  }

  return <button onClick={onClick}>Open Modal</button>;
}
```

---

## Checklist

* [ ] Define event
* [ ] Create emitter
* [ ] Register handle
* [ ] Create handler (Zustand)
* [ ] Cleanup listeners
* [ ] Mount the handler component in the application root
* [ ] Emit event

---

## Best Practices

1. Always cleanup listeners
2. Keep payloads simple
3. Strong typing
4. Organize by domain
5. Use clear action names
