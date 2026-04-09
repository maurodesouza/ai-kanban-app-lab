'use client';

import { useSnapshot } from 'valtio';

import { Dialog } from '@/components/atoms/dialog';
import { FlexibleRender } from '@/components/helpers/flexible-render';

import { events } from '@/events';
import { modalStore } from '@/store/modal';

export function Modal() {
  const modalState = useSnapshot(modalStore);

  console.log('modalState', modalState)

  return (
    <Dialog.Root 
      open={!!modalState.modal} 
      onOpenChange={events.modal.hide}
    >
      <FlexibleRender render={modalState.modal} />
    </Dialog.Root>
  );
}
