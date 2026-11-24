import type { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";
import type * as React from "react";
import { Clickable } from "@/components/atoms/clickable";
import { Text } from "@/components/atoms/text";
import { cn } from "@/lib/cn";
import { layer } from "../layer";

// Structural type of the namespace — only the parts the factory consumes.
// Root and Trigger are deliberately excluded: they differ between Dialog and
// AlertDialog and stay in the specific component. The types are taken from
// Dialog because AlertDialog reuses Dialog's parts at runtime (Backdrop,
// Popup, Title, Description, Close, Portal, Viewport are all re-exported
// from Dialog's modules).
type LayerNamespace = {
    Portal: typeof DialogPrimitive.Portal;
    Backdrop: typeof DialogPrimitive.Backdrop;
    Popup: typeof DialogPrimitive.Popup;
    Title: typeof DialogPrimitive.Title;
    Description: typeof DialogPrimitive.Description;
    Close: typeof DialogPrimitive.Close;
    Viewport: typeof DialogPrimitive.Viewport;
};

export type LayerParts = ReturnType<typeof createLayerParts>;

export function createLayerParts(P: LayerNamespace) {
    function Backdrop({
        className,
        ...props
    }: React.ComponentProps<typeof P.Backdrop>) {
        return (
            <P.Backdrop
                data-slot="layer-backdrop"
                className={cn(layer.backdrop(), className as string)}
                {...props}
            />
        );
    }

    function Content({
        className,
        showClose = true,
        children,
        ...props
    }: React.ComponentProps<typeof P.Popup> & {
        /** Whether to render the close affordance. A boolean that toggles a
         * part is not a style variant. alert-dialog sets this to false. */
        showClose?: boolean;
    }) {
        return (
            <P.Popup
                data-slot="layer-content"
                className={cn(
                    layer.panel(),
                    // The centred layer's motion: the family fades, the
                    // dialog adds a small scale so it settles into place
                    // rather than blinking on. `scale` is its own property
                    // in Tailwind v4, so it composes with any transform.
                    "duration-200 data-starting-style:scale-95 data-ending-style:scale-95",
                    className as string,
                )}
                {...props}
            >
                {showClose ? (
                    <P.Close
                        render={
                            <Clickable.Button
                                variant="icon"
                                shape="square"
                                size="sm"
                                aria-label="Close"
                                className="absolute top-4 end-4"
                            />
                        }
                    >
                        <XIcon />
                    </P.Close>
                ) : null}
                {children}
            </P.Popup>
        );
    }

    function Header({ className, ...props }: React.ComponentProps<"div">) {
        return (
            <div
                data-slot="layer-header"
                className={cn(layer.header(), className as string)}
                {...props}
            />
        );
    }

    function Body({ className, ...props }: React.ComponentProps<"div">) {
        return (
            <div
                data-slot="layer-body"
                className={cn(layer.body(), className as string)}
                {...props}
            />
        );
    }

    function Footer({ className, ...props }: React.ComponentProps<"div">) {
        return (
            <div
                data-slot="layer-footer"
                className={cn(layer.footer(), className as string)}
                {...props}
            />
        );
    }

    function Title({
        className,
        ...props
    }: React.ComponentProps<typeof P.Title>) {
        return (
            <P.Title
                data-slot="layer-title"
                // Text.Heading brings the typography (font-semibold, size).
                // layer.title brings only palette. The primitive's a11y wiring
                // (the id for aria-labelledby) survives the composition —
                // verified: render merges props, it does not replace them.
                render={<Text.Heading as="h2" />}
                className={cn(layer.title(), className as string)}
                {...props}
            />
        );
    }

    function Description({
        className,
        ...props
    }: React.ComponentProps<typeof P.Description>) {
        return (
            <P.Description
                data-slot="layer-description"
                render={<Text.Paragraph />}
                className={cn(layer.description(), className as string)}
                {...props}
            />
        );
    }

    function Close({
        className,
        ...props
    }: React.ComponentProps<typeof P.Close>) {
        return (
            <P.Close
                data-slot="layer-close"
                render={<Clickable.Button variant="ghost" size="sm" />}
                className={className as string}
                {...props}
            />
        );
    }

    return {
        Backdrop,
        Content,
        Header,
        Body,
        Footer,
        Title,
        Description,
        Close,
    };
}
