import { describe, expect, it } from "vitest";
import { TaskFormStore, type TaskFormValues } from "./store";

const values: TaskFormValues = {
    mode: "create",
    taskId: null,
    columnId: null,
    title: "Write docs",
    description: "",
    priority: "medium",
    startDate: "2026-05-01",
    endDate: "2026-05-02",
};

describe("TaskFormStore", () => {
    it("presents the create form", () => {
        const store = new TaskFormStore();
        store.setForm(values);

        expect(store.$dialogUI.title).toBe("New task");
        expect(store.$submitUI).toEqual({
            label: "Create task",
            disabled: false,
        });
        expect(store.$endDateFieldUI).toMatchObject({
            value: "2026-05-02",
            min: "2026-05-01",
            isInvalid: false,
        });
        expect(store.$priorityFieldUI.options).toEqual([
            { value: "low", label: "Low" },
            { value: "medium", label: "Medium" },
            { value: "high", label: "High" },
        ]);
    });

    it("presents the edit form", () => {
        const store = new TaskFormStore();
        store.setForm({ ...values, mode: "edit", taskId: "t1" });

        expect(store.$dialogUI.title).toBe("Edit task");
        expect(store.$submitUI.label).toBe("Save changes");
    });

    it("presents errors and disables submit while they are shown", () => {
        const store = new TaskFormStore();
        store.setForm(values);
        store.setErrors({ title: "Title is required.", column: "No column" });

        expect(store.$titleFieldUI).toMatchObject({
            error: "Title is required.",
            isInvalid: true,
        });
        expect(store.$formErrorUI).toEqual({
            hasError: true,
            message: "No column",
        });
        expect(store.$submitUI.disabled).toBe(true);
    });

    it("clears errors when the form is filled again", () => {
        const store = new TaskFormStore();
        store.setErrors({ title: "Title is required." });
        store.setForm(values);

        expect(store.$hasErrors).toBe(false);
    });
});
