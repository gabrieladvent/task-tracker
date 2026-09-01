import { TaskActivity } from "@/Pages/Periods/types/period";

export type ActivityPreset =
    | "today"
    | "yesterday"
    | "week"
    | "month"
    | "custom";

export interface DigestProject {
    id: string;
    name: string;
    color: string | null;
}

export interface DigestSummary {
    created: number;
    carried_over: number;
    status_changed: number;
    updated: number;
    completed: number;
    total: number;
}

export interface DigestTotals extends DigestSummary {
    active_days: number;
    active_tasks: number;
}

export interface DigestTaskGroup {
    root_task_id: string;
    task_id: string | null;
    period_id: string | null;
    title: string;
    status: string | null;
    project: DigestProject | null;
    is_deleted: boolean;
    activities: TaskActivity[];
}

export interface DigestDay {
    date: string;
    day_name: string;
    formatted_date: string;
    is_today: boolean;
    summary: DigestSummary;
    tasks: DigestTaskGroup[];
}

export interface ActivityDigest {
    days: DigestDay[];
    totals: DigestTotals;
}

export interface ActivityFilters {
    preset: ActivityPreset;
    from: string;
    to: string;
    project_id: string | null;
}
