import { command } from "#/lib/command";

command.handle("theme.toggle", async () => {
    if (typeof document === "undefined") return;

    const body = document.body;

    const isDark = body.classList.contains("theme-dark");

    if (isDark) {
        body.classList.remove("theme-dark");
        body.classList.add("theme-light");
        localStorage.setItem("theme", "light");
    } else {
        body.classList.remove("theme-light");
        body.classList.add("theme-dark");
        localStorage.setItem("theme", "dark");
    }
});
