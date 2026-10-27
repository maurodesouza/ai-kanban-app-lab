import { PlusIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import type { ComponentProps } from "react";
import { Clickable } from "#/components/atoms/clickable";
import { Text } from "#/components/atoms/text";
import { Skeleton } from "#/components/ui/skeleton";
import { useKanban } from "#/features/kanban/hooks/use-kanban";
import { cn } from "#/lib/cn";
import { actions } from "#/lib/command";

const SKELETON_COLUMNS = ["a", "b", "c"];

export function Container({ className, ...props }: ComponentProps<"main">) {
    return (
        <main
            className={cn("flex h-full min-h-0 flex-col", className)}
            {...props}
        />
    );
}

export function Header({ className, ...props }: ComponentProps<"header">) {
    return (
        <header
            className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-3 border-palette-line border-b px-6 py-3",
                className,
            )}
            {...props}
        />
    );
}

export const Title = observer(() => {
    const store = useKanban();
    const { title } = store.$boardUI;

    return (
        <Text.Heading as="h1" className="me-auto font-semibold text-lg">
            {title}
        </Text.Heading>
    );
});

export function Toolbar({ className, ...props }: ComponentProps<"div">) {
    return (
        <div
            className={cn("flex flex-wrap items-center gap-2", className)}
            {...props}
        />
    );
}

export const NewTaskAction = observer(() => {
    const store = useKanban();
    const { newTaskLabel } = store.$boardUI;

    return (
        <Clickable.Button
            className="palette-blue"
            onClick={() => actions.kanban.taskDialog.openCreate({})}
        >
            <PlusIcon />
            {newTaskLabel}
        </Clickable.Button>
    );
});

/** Scrollable board area. Shows column placeholders until the board is restored. */
export const Content = observer(
    ({ className, children, ...props }: ComponentProps<"div">) => {
        const store = useKanban();
        const { isLoading } = store.$boardUI;

        return (
            <div
                className={cn("min-h-0 flex-1 overflow-x-auto", className)}
                {...props}
            >
                <div className="flex h-full w-max gap-4 p-6">
                    {isLoading
                        ? SKELETON_COLUMNS.map((key) => (
                              <Skeleton
                                  key={key}
                                  className="h-full w-72 rounded-xl"
                              />
                          ))
                        : children}
                </div>
            </div>
        );
    },
);
