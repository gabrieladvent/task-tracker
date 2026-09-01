import { useCallback, useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
    CalendarClock,
    Flag,
    GitPullRequest,
    History,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { TaskActivity, TaskActivityType, TaskTimeline as TaskTimelineData } from '@/Pages/Periods/types/period';
import { getStatusBadgeColor, getStatusLabel } from '@/Pages/Periods/utils';

interface TaskTimelineProps {
    taskId: string;
    /** Bumped by the parent after a save so the timeline picks up the new entry. */
    refreshToken?: number;
}

const COLLAPSED_COUNT = 8;

const ICONS: Record<TaskActivityType, typeof Plus> = {
    created: Plus,
    carried_over: CalendarClock,
    status_changed: Flag,
    field_changed: Pencil,
    pr_linked: GitPullRequest,
    deleted: Trash2,
};

const FIELD_LABELS: Record<string, string> = {
    title: 'Title',
    description: 'Description',
    priority: 'Priority',
    story_points: 'Story points',
    project_id: 'Project',
    task_date: 'Date',
};

const formatDay = (value: string | null): string =>
    value ? format(parseISO(value), 'd MMM yyyy') : '—';

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

const StatusPill = ({ status }: { status: string }) => (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeColor(status)}`}>
        {getStatusLabel(status)}
    </span>
);

const Chip = ({ label, value }: { label: string; value: string }) => (
    <div className="rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700/40 px-3 py-2">
        <div className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</div>
    </div>
);

const ActivityDescription = ({ activity }: { activity: TaskActivity }) => {
    switch (activity.type) {
        case 'created': {
            const status = (activity.to as { status?: string } | null)?.status;
            return (
                <span className="flex flex-wrap items-center gap-2">
                    Task created
                    {status && <StatusPill status={status} />}
                </span>
            );
        }

        case 'carried_over':
            return (
                <span>
                    Carried over{activity.from ? ` from ${formatDay(String(activity.from))}` : ''} to{' '}
                    <span className="font-medium">{formatDay(activity.to ? String(activity.to) : activity.task_date)}</span>
                </span>
            );

        case 'status_changed':
            return (
                <span className="flex flex-wrap items-center gap-2">
                    Status
                    {activity.from ? <StatusPill status={String(activity.from)} /> : <span>—</span>}
                    <span aria-hidden="true">&rarr;</span>
                    {activity.to ? <StatusPill status={String(activity.to)} /> : <span>—</span>}
                </span>
            );

        case 'pr_linked':
            return <span>{activity.to ? 'Pull request linked' : 'Pull request removed'}</span>;

        case 'deleted':
            return <span>Task deleted</span>;

        default: {
            const field = FIELD_LABELS[activity.field ?? ''] ?? activity.field ?? 'Field';

            if (activity.field === 'description' || activity.field === 'title') {
                return <span>{field} updated</span>;
            }

            return (
                <span>
                    {field}: <span className="text-gray-500 dark:text-gray-400 line-through">{formatValue(activity.from)}</span>{' '}
                    <span aria-hidden="true">&rarr;</span>{' '}
                    <span className="font-medium">{formatValue(activity.to)}</span>
                </span>
            );
        }
    }
};

export default function TaskTimeline({ taskId, refreshToken = 0 }: TaskTimelineProps) {
    const [timeline, setTimeline] = useState<TaskTimelineData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [showAll, setShowAll] = useState(false);

    const loadTimeline = useCallback(async (signal: AbortSignal) => {
        try {
            setIsLoading(true);
            setHasError(false);

            const response = await fetch(`/tasks/${taskId}/activities`, { signal });
            if (!response.ok) throw new Error(`Request failed: ${response.status}`);

            setTimeline(await response.json());
        } catch (error) {
            if ((error as Error).name === 'AbortError') return;
            console.error('Failed to load task activities:', error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    }, [taskId]);

    useEffect(() => {
        const controller = new AbortController();
        loadTimeline(controller.signal);

        return () => controller.abort();
    }, [loadTimeline, refreshToken]);

    // Newest first — the recent changes are what you actually came to check.
    const entries = useMemo(
        () => [...(timeline?.activities ?? [])].reverse(),
        [timeline]
    );

    const visibleEntries = showAll ? entries : entries.slice(0, COLLAPSED_COUNT);

    if (isLoading && !timeline) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading history...</p>
        );
    }

    if (hasError) {
        return (
            <p className="text-sm text-red-600 dark:text-red-400">
                Could not load this task's history.
            </p>
        );
    }

    if (!timeline || entries.length === 0) {
        return (
            <p className="text-sm text-gray-500 dark:text-gray-400">
                No history recorded yet. Changes from here on will show up in this timeline.
            </p>
        );
    }

    const { summary } = timeline;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Chip label="Started" value={formatDay(summary.first_task_date)} />
                <Chip
                    label="Age"
                    value={`${summary.age_days} day${summary.age_days === 1 ? '' : 's'}`}
                />
                <Chip label="Carried over" value={`${summary.carry_over_count}x`} />
                <Chip label="Versions" value={String(summary.version_count)} />
            </div>

            {summary.is_open && summary.carry_over_count >= 3 && (
                <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                    This task has been rolled over {summary.carry_over_count} times and is still open.
                </p>
            )}

            <ol className="relative space-y-4 border-l border-gray-200 dark:border-slate-600 pl-6">
                {visibleEntries.map((activity) => {
                    const Icon = ICONS[activity.type] ?? Pencil;

                    return (
                        <li key={activity.id} className="relative">
                            <span
                                className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-gray-800"
                                style={{ backgroundColor: activity.color }}
                            >
                                <Icon size={11} className="text-white" />
                            </span>

                            <div className="text-sm text-gray-800 dark:text-gray-200">
                                <ActivityDescription activity={activity} />
                            </div>
                            <time
                                dateTime={activity.occurred_at}
                                className="text-xs text-gray-500 dark:text-gray-400"
                            >
                                {format(parseISO(activity.occurred_at), 'd MMM yyyy, HH:mm')}
                            </time>
                        </li>
                    );
                })}
            </ol>

            {entries.length > COLLAPSED_COUNT && (
                <button
                    type="button"
                    onClick={() => setShowAll((previous) => !previous)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                >
                    <History size={14} />
                    {showAll
                        ? 'Show less'
                        : `Show all ${entries.length} entries`}
                </button>
            )}
        </div>
    );
}
