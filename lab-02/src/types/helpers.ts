import type { ReactElement } from 'react';

export type Renderable<T = unknown> =
  | ((props?: T) => ReactElement)
  | ReactElement;
