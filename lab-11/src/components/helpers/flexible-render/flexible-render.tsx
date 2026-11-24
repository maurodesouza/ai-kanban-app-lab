import type { ComponentType, ReactElement } from "react";

export type Renderable = ComponentType | ReactElement;

export function FlexibleRender({ content }: { content: Renderable }) {
    if (typeof content === "function") {
        const Component = content;
        return <Component />;
    }
    return content;
}
