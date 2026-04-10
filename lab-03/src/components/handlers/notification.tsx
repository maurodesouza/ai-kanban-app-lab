'use client';

import { useEffect, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import { events } from '@/events';
import { Events } from '@/types/events';
import type { NotificationPayload } from '@/events/handles/notification';

function NotificationHandler() {
  function dispatchToast(
    intention: 'success' | 'error' | 'info' | 'warning',
    event: CustomEvent<NotificationPayload>
  ) {
    const payload = event.detail;
    const defaultMessage = {
      success: 'Success!',
      error: 'Error!',
      info: 'Info',
      warning: 'Warning!',
    };

    toast[intention](payload.message || defaultMessage[intention], {
      description: payload.description,
      duration: payload.duration,
      action: payload.action,
      id: payload.id,
      icon: payload.icon,
      cancel: payload.cancel,
      dismissible: payload.dismissible,
    });
  }

  const onSuccess = useCallback((event: CustomEvent<NotificationPayload>) => {
    dispatchToast('success', event);
  }, []);

  const onError = useCallback((event: CustomEvent<NotificationPayload>) => {
    dispatchToast('error', event);
  }, []);

  const onInfo = useCallback((event: CustomEvent<NotificationPayload>) => {
    dispatchToast('info', event);
  }, []);

  const onWarning = useCallback((event: CustomEvent<NotificationPayload>) => {
    dispatchToast('warning', event);
  }, []);

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
  }, [onSuccess, onError, onInfo, onWarning]);

  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        className:
          ' bg-tone-luminosity-100! text-tone-foreground-contrast! border-tone-ring-inner!',
        classNames: {
          title: 'text-tone-foreground-contrast!',
          description: 'text-tone-foreground-contrast!',
          cancelButton: 'text-foreground font-medium',
          closeButton: 'text-foreground-min',
          success: 'tone palette-success',
          error: 'tone palette-danger',
          warning: 'tone palette-warning',
          info: 'tone palette-brand',
        },
      }}
    />
  );
}

export { NotificationHandler };
