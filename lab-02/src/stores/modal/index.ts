import { proxy } from 'valtio';
import type { Renderable } from '@/types/helpers';

type ModalStoreState = {
  modal: Renderable | null;
};

export const modalStore = proxy<ModalStoreState>({ modal: null });
