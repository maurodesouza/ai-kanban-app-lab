function moveArrayItem<T>(list: readonly T[], from: number, to: number): T[] {
    const next = [...list];
    const [item] = next.splice(from, 1);

    if (item === undefined) return next;

    next.splice(array.math.clamp(to, 0, next.length), 0, item);

    return next;
}

export const array = {
    move: moveArrayItem,

    insert: <T>(list: readonly T[], index: number, item: T): T[] => {
        const next = [...list];

        next.splice(array.math.clamp(index, 0, next.length), 0, item);

        return next;
    },

    without: <T>(list: readonly T[], item: T): T[] =>
        list.filter((current) => current !== item),

    math: {
        clamp: (value: number, min: number, max: number): number =>
            Math.min(Math.max(value, min), max),
    },
};
