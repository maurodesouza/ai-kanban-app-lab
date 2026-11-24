import type { PropsWithChildren } from "react";
import { Text } from "#/components/atoms/text";

function Container({ children }: PropsWithChildren) {
    return (
        <article className="palette-raised rounded-xl border border-palette-line bg-palette-base p-3 text-palette-contrast shadow-xs">
            {children}
        </article>
    );
}

function Header({ children }: PropsWithChildren) {
    return (
        <header className="flex flex-wrap items-start justify-between gap-2">
            {children}
        </header>
    );
}

function Title({ children }: PropsWithChildren) {
    return (
        <Text.Heading
            as="h3"
            className="min-w-0 flex-1 break-words text-sm font-semibold"
        >
            {children}
        </Text.Heading>
    );
}

function Footer({ children }: PropsWithChildren) {
    return <footer className="mt-3 flex flex-wrap gap-1">{children}</footer>;
}

export const TaskParts = { Container, Header, Title, Footer };
