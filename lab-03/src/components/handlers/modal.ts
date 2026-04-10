'use client';

import React, { useEffect, useState } from 'react';
import { events } from '@/events';
import { Events } from '@/types/events';
import { Dialog } from '@/components/molecules/dialog';
import { FlexibleRender } from '@/components/helpers/flexible-render';
import type { Renderable } from '@/types/helpers';
import type { ShowModalPayload } from '@/events/handles/modal';

function ModalHandler() {
  const [modal, setModal] = useState<Renderable | null>(null);

  function onShowModal(event: CustomEvent<ShowModalPayload>) {
    setModal(event.detail.modal);
  }

  function onHideModal() {
    setModal(null);
  }

  useEffect(() => {
    events.on(Events.MODAL_SHOW, onShowModal);
    events.on(Events.MODAL_HIDE, onHideModal);

    return () => {
      events.off(Events.MODAL_SHOW, onShowModal);
      events.off(Events.MODAL_HIDE, onHideModal);
    };
  }, []);

  if (!modal) return null;

  return React.createElement(
    Dialog.Root,
    {
      open: !!modal,
      onOpenChange: (open: boolean) => !open && events.modal.hide(),
    },
    React.createElement(FlexibleRender, { render: modal })
  );
}

export { ModalHandler };
