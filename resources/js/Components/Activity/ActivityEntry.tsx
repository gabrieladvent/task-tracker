import { format, parseISO } from 'date-fns';
import {
    CalendarClock,
    Flag,
    GitPullRequest,
    Pencil,
    Plus,
    Trash2,
} from 'lucide-react';
import { TaskActivity, TaskActivityType } from '@/Pages/Periods/types/period';
import { getStatusBadgeColor, getStatusLabel } from '@/Pages/Periods/utils';

export const ACTIVITY_ICONS: Record<TaskActivityType, typeof Plus> = {
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

export const formatActivityDay = (value: string | null): string =>
    value ? format(parseISO(value), 'd MMM yyyy') : '—';

const formatValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};

export const StatusPill = ({ status }: { status: string }) => (
    <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeColor(status)}`}>
        {getStatusLabel(status)}
    </span>
);

export const ActivityDescription = ({ activity }: { activity: TaskActivity }) => {
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
                    Carried over{activity.from ? ` from ${formatActivityDay(String(activity.from))}` : ''} to{' '}
                    <span className="font-medium">
                        {formatActivityDay(activity.to ? String(activity.to) : activity.task_date)}
                    </span>
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
                    {field}:{' '}
                    <span className="text-gray-500 dark:text-gray-400 line-through">
                        {formatValue(activity.from)}
                    </span>{' '}
                    <span aria-hidden="true">&rarr;</span>{' '}
                    <span className="font-medium">{formatValue(activity.to)}</span>
                </span>
            );
        }
    }
};

interface ActivityEntryProps {
    activity: TaskActivity;
    /** date-fns pattern for the timestamp; day-grouped views only need the clock. */
    timeFormat?: string;
    /** Match the ring to the surface the timeline sits on. */
    ringClassName?: string;
}

/**
 * One dot on a vertical timeline. Expects an `<ol>` parent with a left border
 * and `pl-6`, which is what positions the dot on the line.
 */
export default function ActivityEntry({
    activity,
    timeFormat = 'd MMM yyyy, HH:mm',
    ringClassName = 'ring-white dark:ring-gray-800',
}: ActivityEntryProps) {
    const Icon = ACTIVITY_ICONS[activity.type] ?? Pencil;

    return (
        <li className="relative">
            <span
                className={`absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full ring-4 ${ringClassName}`}
                style={{ backgroundColor: activity.color }}
            >
                <Icon size={11} className="text-white" />
            </span>

            <div className="text-sm text-gray-800 dark:text-gray-200">
                <ActivityDescription activity={activity} />
            </div>
            <time dateTime={activity.occurred_at} className="text-xs text-gray-500 dark:text-gray-400">
                {format(parseISO(activity.occurred_at), timeFormat)}
            </time>
        </li>
    );
}
