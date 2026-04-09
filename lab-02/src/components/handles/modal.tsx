'use client';

import React, { useEffect } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import type { Renderable } from '@/types/helpers';

function ModalHandler() {
  function handleModalShow(args: Renderable) {
    console.log('Modal show event received:', args);
    // TODO: Update modal store with new modal content
  }

  function handleModalHide(args: unknown) {
    console.log('Modal hide event received:', args);
    // TODO: Update modal store to hide modal
  }

  useEffect(() => {
    // Subscribe to modal events
    events.on(Events.MODAL_SHOW, handleModalShow);
    events.on(Events.MODAL_HIDE, handleModalHide);
    
    return () => {
      // Cleanup event subscriptions
      events.off(Events.MODAL_SHOW, handleModalShow);
      events.off(Events.MODAL_HIDE, handleModalHide);
    };
  }, []);

  return null; // Handler components are typically invisible
}

export { ModalHandler };
