import type { FilterState, Priority, TaskInput } from "#/types/domain";
import type {
    ActionPaths,
    PathValue,
    PayloadFromAction,
    ReturnFromAction,
} from "#/types/helpers";

// #region Transitions
export type TransitionKey = unknown | unknown[];
// #endregion

// #region Command Bus
export type Handler<TPayload = unknown, TResult = void> = (
    payload: TPayload,
) => Promise<TResult>;

export type Dispose = () => void;

export type DispatchConfig = {
    transition?: TransitionKey;
};
// #endregion

// #region Instance Registry
export type Instance = {
    id: string;
    label?: string;
};
// #endregion

// #region Actions
export type Config = DispatchConfig & {
    instanceId: string;
};

export type Action<TPayload = undefined, TResult = void> = [TPayload] extends [
    undefined,
]
    ? (payload?: TPayload, config?: DispatchConfig) => Promise<TResult>
    : (payload: TPayload, config?: DispatchConfig) => Promise<TResult>;

export type ScopedAction<TPayload = undefined, TResult = void> = [
    TPayload,
] extends [undefined]
    ? (payload: undefined, config: Config) => Promise<TResult>
    : (payload: TPayload, config: Config) => Promise<TResult>;

export interface Actions {
    modal: {
        open: Action<{
            mode: "create" | "edit";
            columnId?: string;
            taskId?: string;
        }>;
        close: Action;
        confirm: {
            open: Action<{
                id: string;
                title: string;
                message: string;
                confirmCommand: string;
                confirmPayload: unknown;
            }>;
            close: Action;
        };
    };
    kanban: {
        task: {
            add: Action<{ input: TaskInput; columnId?: string }>;
            edit: Action<{ taskId: string; input: TaskInput }>;
            delete: Action<{ taskId: string }>;
            move: Action<{
                taskId: string;
                toColumnId: string;
                toIndex?: number;
            }>;
            priority: {
                set: Action<{ taskId: string; priority: Priority }>;
            };
            filter: Action<{ filter: Partial<FilterState> }>;
        };
        column: {
            add: Action;
            create: Action<{ title: string }>;
            rename: Action<{ columnId: string; title: string }>;
            move: Action<{ columnId: string; toIndex: number }>;
            delete: Action<{ columnId: string }>;
        };
    };
    theme: {
        toggle: Action;
        set: Action<{ mode: "light" | "dark" }>;
    };
}
// #endregion

// #region Aliases
export type ActionPath = ActionPaths<Actions>;

export type ActionValue<TCommand extends ActionPath> = PathValue<
    Actions,
    TCommand
>;

export type CommandMeta = { label: string };
// #endregion

// #region Derived
export type ActionPayload<TCommand extends ActionPath> = PayloadFromAction<
    ActionValue<TCommand>
>;

export type ActionReturn<TCommand extends ActionPath> = ReturnFromAction<
    ActionValue<TCommand>
>;

export type IsScopedCommand<TCommand extends ActionPath> =
    ActionValue<TCommand> extends (payload: any, config: Config) => Promise<any>
        ? true
        : false;

export type HandleConfig<TCommand extends ActionPath> =
    IsScopedCommand<TCommand> extends true
        ? { instanceId: string; meta?: CommandMeta }
        : { instanceId?: string; meta?: CommandMeta };

export type SecondArg<T> = T extends (a: any, b: infer B) => any ? B : never;

export type ScopedCommands = {
    [K in ActionPath]: SecondArg<ActionValue<K>> extends Config ? K : never;
}[ActionPath];

export type UnscopedCommands = Exclude<ActionPath, ScopedCommands>;
// #endregion
