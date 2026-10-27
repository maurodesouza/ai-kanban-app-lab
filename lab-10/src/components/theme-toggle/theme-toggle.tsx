import { MoonIcon, SunIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Clickable } from "#/components/atoms/clickable";
import { Tooltip } from "#/components/ui/tooltip";
import { useTheme } from "#/hooks/use-theme";
import { actions } from "#/lib/command";

export const ThemeToggle = observer(() => {
    const store = useTheme();
    const { icon, label } = store.$themeToggleUI;

    return (
        <Tooltip.Root>
            <Tooltip.Trigger
                render={
                    <Clickable.Button
                        variant="icon"
                        shape="square"
                        size="md"
                        aria-label={label}
                        onClick={() => actions.theme.toggle()}
                    />
                }
            >
                {icon === "sun" ? <SunIcon /> : <MoonIcon />}
            </Tooltip.Trigger>
            <Tooltip.Content>{label}</Tooltip.Content>
        </Tooltip.Root>
    );
});
