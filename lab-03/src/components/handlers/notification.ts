'use client';

import { useEffect } from 'react';
import { toast, Toaster } from 'sonner';
import { events } from '@/events';
import { Events } from '@/types/events';
import type { NotificationPayload } from '@/events/handles/notification';

function NotificationHandler() {
  function onSuccess(event: CustomEvent<NotificationPayload>) {
    const payload = event.detail;
    toast.success(payload.message || 'Success!', {
      description: payload.description,
      duration: payload.duration,
      action: payload.action,
      id: payload.id,
      icon: payload.icon,
      cancel: payload.cancel,
      dismissible: payload.dismissible,
    });
  }

  function onError(event: CustomEvent<NotificationPayload>) {
    const payload = event.detail;
    toast.error(payload.message || 'Error!', {
      description: payload.description,
      duration: payload.duration,
      action: payload.action,
      id: payload.id,
      icon: payload.icon,
      cancel: payload.cancel,
      dismissible: payload.dismissible,
    });
  }

  function onInfo(event: CustomEvent<NotificationPayload>) {
    const payload = event.detail;
    toast.info(payload.message || 'Info', {
      description: payload.description,
      duration: payload.duration,
      action: payload.action,
      id: payload.id,
      icon: payload.icon,
      cancel: payload.cancel,
      dismissible: payload.dismissible,
    });
  }

  function onWarning(event: CustomEvent<NotificationPayload>) {
    const payload = event.detail;
    toast.warning(payload.message || 'Warning!', {
      description: payload.description,
      duration: payload.duration,
      action: payload.action,
      id: payload.id,
      icon: payload.icon,
      cancel: payload.cancel,
      dismissible: payload.dismissible,
    });
  }

  useEffect(() => {
    events.on(Events.NOTIFICATION_SUCCESS, onSuccess);
    events.on(Events.NOTIFICATION_ERROR, onError);
    events.on(Events.NOTIFICATION_INFO, onInfo);
    events.on(Events.NOTIFICATION_WARNING, onWarning);

    return () => {
      events.off(Events.NOTIFICATION_SUCCESS, onSuccess);
      events.off(Events.NOTIFICATION_ERROR, onError);
      events.off(Events.NOTIFICATION_INFO, onInfo);
      events.off(Events.NOTIFICATION_WARNING, onWarning);
    };
  }, []);

  return null;
}

export { NotificationHandler };
