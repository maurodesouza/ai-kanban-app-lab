import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// NOTE: the palette list is hardcoded on purpose. tailwind-merge needs to know
// which classes form a single "palette" group so that `cn("palette-blue",
// "palette-danger")` resolves to one (the last) rather than both. The cost of
// correct merge behaviour is that adding a palette means adding it here too.
// A test asserts this list agrees with the palettes directory — see
// tests/palette-contract.test.ts.
const customTwMerge = extendTailwindMerge<"palette">({
    extend: {
        classGroups: {
            palette: [
                {
                    palette: [
                        "surface",
                        "raised",
                        "danger",
                        "blue",
                        "green",
                        "orange",
                        "purple",
                        "rose",
                        "surface-blue",
                        "surface-purple",
                        "surface-green",
                        "surface-orange",
                        "surface-rose",
                    ],
                },
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return customTwMerge(clsx(inputs));
}
