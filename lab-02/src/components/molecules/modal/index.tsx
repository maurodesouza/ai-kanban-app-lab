'use client';

import { useState, useEffect } from 'react';

import { Dialog } from '@/components/atoms/dialog';
import { FlexibleRender } from '@/components/helpers/flexible-render';

import { events } from '@/events';
import { Events } from '@/types/events';
import type { Renderable } from '@/types/helpers';

export function Modal() {
  const [modal, setModal] = useState<Renderable>();

  function handleModalShow(event: CustomEvent<Renderable>) {
    setModal(event.detail);
  }

  function handleModalHide() {
    setModal(undefined);
  }

  useEffect(() => {

    events.on(Events.MODAL_SHOW, handleModalShow);
    events.on(Events.MODAL_HIDE, handleModalHide);

    return () => {
      events.off(Events.MODAL_SHOW, handleModalShow);
      events.off(Events.MODAL_HIDE, handleModalHide);
    };
  }, []);

  return (
    <Dialog.Root 
      open={!!modal} 
      onOpenChange={(open) => !open && events.modal.hide()}
    >
      <FlexibleRender render={modal} />
    </Dialog.Root>
  );
}
