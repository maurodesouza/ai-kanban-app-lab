import { observer } from "mobx-react-lite";
import { Clickable } from "#/components/atoms/clickable";
import { actions } from "#/lib/command";
import { themeStore } from "#/store/theme/store";

export const ThemeAction = observer(function ThemeAction() {
    const ui = themeStore.$toggleUI;
    return (
        <Clickable.Button
            type="button"
            variant="outline"
            onClick={() => void actions.theme.toggle()}
        >
            <span aria-hidden="true">{ui.icon}</span> {ui.label}
        </Clickable.Button>
    );
});
