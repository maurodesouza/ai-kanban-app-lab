import { type ComponentType, isValidElement, type ReactElement } from "react";

export type Renderable = ComponentType | ReactElement;

export function FlexibleRender({ content }: { content: Renderable }) {
    if (isValidElement(content)) return content;
    const Component = content;
    return <Component />;
}
