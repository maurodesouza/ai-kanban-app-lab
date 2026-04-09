import React from 'react';
import { Renderable } from '@/types/helpers';

type FlexibleRenderProps = {
  render?: Renderable | {
    type: string | ((props: unknown) => React.ReactNode) | object;
    props: unknown;
    key: string | null;
  } | null;
};

export function FlexibleRender(props: FlexibleRenderProps) {
  const { render: Render } = props;

  if (!Render) return <React.Fragment />;

  if (React.isValidElement(Render)) return <>{Render}</>;

  return <Render />;
}
