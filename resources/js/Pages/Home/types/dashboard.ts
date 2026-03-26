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
