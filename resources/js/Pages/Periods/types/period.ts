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

export interface TasksByDate {
    date: string;
    day_name: string;
    formatted_date: string;
    tasks: Task[];
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

export interface CalendarTask {
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
}

export interface NewTaskData {
    title: string;
    description: string;
    status: string;
    priority: string;
    story_points: string;
    project_id?: string;
}
