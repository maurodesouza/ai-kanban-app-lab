const mode =
    import.meta.env?.MODE ??
    (typeof process !== "undefined" ? process.env.NODE_ENV : undefined);

export const dev = {
    isDev: mode === "development",

    run: (fn: () => void) => {
        if (dev.isDev) fn();
    },
};
