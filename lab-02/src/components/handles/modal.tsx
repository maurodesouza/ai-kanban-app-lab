'use client';

import { useEffect } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import type { Renderable } from '@/types/helpers';

function ModalHandler() {
  function handleModalShow(args: Renderable) {
    console.log('Modal show event received:', args);
    // TODO: Update modal store with new modal content
  }

  function handleModalHide() {
    console.log('Modal hide event received');
    // TODO: Update modal store to hide modal
  }

  useEffect(() => {
    events.on(Events.MODAL_SHOW, handleModalShow);
    events.on(Events.MODAL_HIDE, handleModalHide);
    
    return () => {
      events.off(Events.MODAL_SHOW, handleModalShow);
      events.off(Events.MODAL_HIDE, handleModalHide);
    };
  }, []);

  return null;
}

export { ModalHandler };
