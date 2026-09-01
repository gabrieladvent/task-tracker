export interface DashboardCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    href?: string;
    isComingSoon?: boolean;
}

export interface QuickActionCardProps extends DashboardCardProps {
    href: string;
}

export interface WelcomeMessageProps {
    title: string;
    description: string;
    ctaText: string;
    ctaHref: string;
}

export interface PeriodStats {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    total_tasks: number;
    done_tasks: number;
    carry_over: number;
    completion_pct: number;
    days_total: number;
    days_elapsed: number;
}

export interface TodayTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    project_name: string | null;
    is_carry_over: boolean;
}

export interface PastPeriod {
    name: string;
    completion_pct: number;
    total: number;
    done: number;
}

export interface ProjectDistributionRow {
    id: string | null;
    name: string;
    color: string;
    total: number;
    done: number;
    share_pct: number;
}

export interface ProjectDistributionScope {
    total: number;
    rows: ProjectDistributionRow[];
}

export interface ProjectDistribution {
    period: ProjectDistributionScope;
    all: ProjectDistributionScope;
}

export interface StuckTask {
    root_task_id: string;
    task_id: string;
    period_id: string;
    title: string;
    status: string;
    priority: string;
    project: {
        id: string;
        name: string;
        color: string | null;
    } | null;
    carry_over_count: number;
    age_days: number;
    first_task_date: string;
    last_task_date: string;
    days_since_status_change: number | null;
}

export interface StuckTasks {
    threshold: number;
    tasks: StuckTask[];
}
