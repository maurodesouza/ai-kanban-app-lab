import type { JSX } from 'react';

export type Renderable<T = unknown> =
  | ((props?: T) => JSX.Element)
  | React.ReactElement;
