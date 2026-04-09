'use client';

import { useEffect } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import type { Renderable } from '@/types/helpers';
import { modalStore } from '@/stores/modal';

function ModalHandler() {
  function handleModalShow(args: Renderable) {
    console.log('Modal show event received:', args);
    
    // Update modal store with new modal content
    modalStore.modal = args;
  }

  function handleModalHide() {
    console.log('Modal hide event received');
    
    // Update modal store to hide modal
    modalStore.modal = undefined;
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
