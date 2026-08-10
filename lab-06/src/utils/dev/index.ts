export const dev = {
    isDev:
        import.meta.env?.MODE === "development" ||
        process.env.NODE_ENV === "development",

    run: (fn: () => void) => {
        if (dev.isDev) fn();
    },
};
