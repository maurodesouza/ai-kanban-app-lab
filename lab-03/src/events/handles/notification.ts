import { Events } from '@/types/events';
import { BaseEventHandle } from './base';

export type NotificationPayload = {
  message?: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  // Permite passar qualquer prop adicional do sonner
  id?: string;
  icon?: React.ReactNode;
  cancel?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  important?: boolean;
};

class NotificationHandleEvents extends BaseEventHandle {
  success(payload: NotificationPayload) {
    this.emit(Events.NOTIFICATION_SUCCESS, payload);
  }

  error(payload: NotificationPayload) {
    this.emit(Events.NOTIFICATION_ERROR, payload);
  }

  info(payload: NotificationPayload) {
    this.emit(Events.NOTIFICATION_INFO, payload);
  }

  warning(payload: NotificationPayload) {
    this.emit(Events.NOTIFICATION_WARNING, payload);
  }
}

export { NotificationHandleEvents };
