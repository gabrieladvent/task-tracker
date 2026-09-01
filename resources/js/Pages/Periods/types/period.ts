export interface Period {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    tasks_count: number;
    completed_tasks_count: number;
    is_current?: boolean;
}

export interface Task {
    id: string;
    title: string;
    description: string | null;
    status:
        | "todo"
        | "in_progress"
        | "on_hold"
        | "code_review"
        | "done"
        | "cancelled";
    priority: "low" | "medium" | "high";
    story_points: number | null;
    project: string | null;
    project_id: string | null;
    task_date: string;
    link_pull_request: string | null;
    notes: string | null;
}

export interface Project {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
}

export interface TaskActivityFlags {
    is_new_today?: boolean;
    is_carry_over?: boolean;
    is_status_changed_today?: boolean;
}

export interface TasksByDate {
    date: string;
    day_name: string;
    formatted_date: string;
    tasks: CalendarTask[];
}

export interface CalendarDay {
    date: string;
    day: number;
    is_in_period: boolean;
    is_today: boolean;
    tasks_count: number;
    completed_count: number;
    tasks?: CalendarTask[];
}

export interface CalendarData {
    weeks: CalendarDay[][];
    month: string;
}

export interface PeriodFormData {
    name: string;
    start_date: string | undefined;
    end_date: string | undefined;
}

export interface CalendarTask extends TaskActivityFlags {
    id: string;
    title: string;
    status: string;
    priority: string;
    description: string | null;
    story_points: number | null;
    project: string | null;
    project_id: string | null;
    link_pull_request: string | null;
    notes: string | null;
    task_date: string;
}

export interface CalendarWeek extends Array<CalendarDay> {}

export interface Props {
    period: Period;
    tasksByDate: TasksByDate[];
    calendarData: CalendarData;
    boardData: BoardData;
}

export interface NewTaskData {
    title: string;
    description: string;
    status: string;
    priority: string;
    story_points: string;
    project_id?: string;
}

export interface BoardTask extends CalendarTask {
    project_name: string | null;
    project_color: string | null;
}

export interface BoardColumn {
    status: string;
    label: string;
    color: string;
    bg: string;
    tasks: BoardTask[];
}

export interface BoardData {
    columns: BoardColumn[];
}

export type TaskActivityType =
    | "created"
    | "carried_over"
    | "status_changed"
    | "field_changed"
    | "pr_linked"
    | "deleted";

export interface TaskActivity {
    id: string;
    task_id: string | null;
    type: TaskActivityType;
    label: string;
    color: string;
    field: string | null;
    from: unknown;
    to: unknown;
    task_date: string | null;
    occurred_at: string;
}

export interface TaskTimelineSummary {
    root_task_id: string;
    version_count: number;
    carry_over_count: number;
    activity_count: number;
    first_seen_at: string | null;
    first_task_date: string | null;
    last_task_date: string | null;
    last_activity_at: string | null;
    age_days: number;
    current_status: string | null;
    is_open: boolean;
}

export interface TaskTimeline {
    summary: TaskTimelineSummary;
    activities: TaskActivity[];
}
