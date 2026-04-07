import { Events, ModalsEnum } from '@/types/events';

export const events = {
  modal: {
    open: (modal: ModalsEnum) => {
      const event = new CustomEvent(Events.MODAL_OPEN, { 
        detail: { modal } 
      });
      document.dispatchEvent(event);
    },
    close: () => {
      const event = new CustomEvent(Events.MODAL_CLOSE);
      document.dispatchEvent(event);
    },
  },
};
