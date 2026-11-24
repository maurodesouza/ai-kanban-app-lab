import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// NOTE: the palette list is hardcoded on purpose. tailwind-merge needs to know
// which classes form a single "palette" group so that `cn("palette-blue",
// "palette-danger")` resolves to one (the last) rather than both. The cost of
// correct merge behaviour is that adding a palette means adding it here too.
// A test asserts this list agrees with the palettes directory — see
// tests/palette-contract.test.ts.
//
// The radius theme is extended with the design-axis members (global.css): without
// it, `cn("rounded-sm", "rounded-pill")` keeps both instead of the last one.
const customTwMerge = extendTailwindMerge<"palette">({
    extend: {
        theme: {
            radius: ["control", "pill"],
        },
        // The icon sizes (global.css `--size-icon*`): `cn("size-icon", "size-6")`
        // keeps only `size-6`.
        classGroups: {
            size: [{ size: ["icon", "icon-xs", "icon-sm", "icon-lg"] }],
            palette: [
                {
                    palette: [
                        "surface",
                        "raised",
                        "neutral",
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
