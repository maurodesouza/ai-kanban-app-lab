import { MoonIcon, SunIcon } from "lucide-react";
import { observer } from "mobx-react-lite";
import { Clickable } from "#/components/atoms/clickable";
import { useTheme } from "#/hooks/use-theme";
import { actions } from "#/lib/command";

export const ThemeToggle = observer(function ThemeToggle() {
    const store = useTheme();
    const { pressed, icon, label } = store.$themeToggleUI;

    return (
        <Clickable.Button
            variant="icon"
            shape="square"
            aria-label={label}
            aria-pressed={pressed}
            title={label}
            onClick={() => actions.theme.toggle()}
        >
            {icon === "sun" ? <SunIcon /> : <MoonIcon />}
        </Clickable.Button>
    );
});
