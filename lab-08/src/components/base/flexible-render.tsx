import type { ReactNode } from "react";

interface FlexibleRenderProps<T> {
    render?: (item: T) => ReactNode;
    children?: ReactNode;
    item?: T;
}

/**
 * Renders either a render-prop (passing `item`) or fallback children.
 * Used by list-renderers like Kanban.Columns and Kanban.Tasks so the
 * page author controls exactly how each item is mounted.
 */
export function FlexibleRender<T>({
    render,
    children,
    item,
}: FlexibleRenderProps<T>) {
    if (render && item !== undefined) {
        return <>{render(item)}</>;
    }
    return <>{children}</>;
}
