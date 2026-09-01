import { Link } from '@inertiajs/react';
import ActivityEntry, { StatusPill } from '@/Components/Activity/ActivityEntry';
import { DigestTaskGroup as TaskGroup } from '@/Pages/Activity/types/activity';

export default function DigestTaskGroup({ group }: { group: TaskGroup }) {
    const title = (
        <span className={group.is_deleted ? 'line-through text-gray-500 dark:text-gray-400' : ''}>
            {group.title}
        </span>
    );

    return (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-wrap items-center gap-2 mb-3">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {group.period_id ? (
                        <Link
                            href={route('periods.show', group.period_id)}
                            className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                        >
                            {title}
                        </Link>
                    ) : (
                        title
                    )}
                </h4>

                {group.status && <StatusPill status={group.status} />}

                {group.project && (
                    <span
                        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-200"
                    >
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: group.project.color ?? '#A0AEC0' }}
                        />
                        {group.project.name}
                    </span>
                )}

                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                    {group.activities.length} change{group.activities.length === 1 ? '' : 's'}
                </span>
            </div>

            <ol className="relative space-y-3 border-l border-gray-200 dark:border-gray-600 pl-6">
                {group.activities.map(activity => (
                    <ActivityEntry key={activity.id} activity={activity} timeFormat="HH:mm" />
                ))}
            </ol>
        </div>
    );
}
