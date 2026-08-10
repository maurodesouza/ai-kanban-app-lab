export type Priority = "none" | "low" | "medium" | "high" | "urgent";

export type TaskDraft = {
    title: string;
    description: string;
    priority: Priority;
    startDate: string;
    endDate: string;
};
