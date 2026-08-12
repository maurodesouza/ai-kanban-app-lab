import type { ReactNode } from "react";

interface FlexibleRenderProps<T> {
    items: readonly T[];
    render: (item: T, index: number) => ReactNode;
    fallback?: ReactNode;
}

export function FlexibleRender<T>({
    items,
    render,
    fallback = null,
}: FlexibleRenderProps<T>) {
    if (items.length === 0) return <>{fallback}</>;
    return <>{items.map((item, index) => render(item, index))}</>;
}
