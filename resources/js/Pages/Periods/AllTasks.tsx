import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ListX, Repeat } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import PerPageSelector from '@/Components/PerPageSelector';
import SearchBar from '@/Components/SearchBar';
import { Paginated } from '@/types';
import { AllTasksFilters, ChainTask, Project } from '@/Pages/Periods/types/period';
import { STATUS_OPTIONS } from '@/Pages/Periods/Constants/StatusOption';
import { getPriorityBadgeColor, getStatusBadgeColor, getStatusLabel } from '@/Pages/Periods/utils';
import TaskDetailModal from '@/Pages/Periods/Components/ShowPeriod/TaskDetailModal';

interface Props {
    tasks: Paginated<ChainTask>;
    projects: Pick<Project, 'id' | 'name' | 'color'>[];
    filters: AllTasksFilters;
}

const formatDay = (date: string) =>
    new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export default function AllTasks({ tasks, projects, filters }: Props) {
    const [selectedTask, setSelectedTask] = useState<ChainTask | null>(null);

    const visit = (changes: Partial<AllTasksFilters>) => {
        const next = { ...filters, ...changes };

        router.get(
            route('periods.all-tasks'),
            {
                search: next.search || null,
                status: next.status || null,
                project_id: next.project_id || null,
                per_page: next.per_page,
            },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // SearchBar fires once on mount; only go to the server when the text
    // actually differs from what this page was rendered with.
    const handleSearch = (search: string) => {
        if (search !== filters.search) {
            visit({ search });
        }
    };

    const selectClass =
        'rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-blue-500 cursor-pointer';

    return (
        <AuthenticatedLayout>
            <Head title="All Tasks" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8 space-y-6">
                    <div>
                        <Link
                            href={route('periods.index')}
                            className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <ArrowLeft size={14} aria-hidden="true" />
                            Periods
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">All Tasks</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Every task across all periods. A task carried over day after day is listed once,
                            showing its latest state.
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[14rem]">
                            <SearchBar
                                initialSearch={filters.search}
                                placeholder="Search task title..."
                                onSearch={handleSearch}
                            />
                        </div>

                        <select
                            aria-label="Filter by status"
                            value={filters.status ?? ''}
                            onChange={(e) => visit({ status: e.target.value || null })}
                            className={selectClass}
                        >
                            <option value="">All statuses</option>
                            {STATUS_OPTIONS.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>

                        <select
                            aria-label="Filter by project"
                            value={filters.project_id ?? ''}
                            onChange={(e) => visit({ project_id: e.target.value || null })}
                            className={selectClass}
                        >
                            <option value="">All projects</option>
                            {projects.map(project => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>

                        <PerPageSelector currentPerPage={filters.per_page} />
                    </div>

                    {tasks.data.length > 0 ? (
                        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                                {tasks.data.map(task => (
                                    <li key={task.root_task_id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedTask(task)}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors focus:outline-none focus-visible:bg-gray-50 dark:focus-visible:bg-gray-700/50"
                                        >
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(task.status)}`}>
                                                    {getStatusLabel(task.status)}
                                                </span>
                                                <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getPriorityBadgeColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                                {task.carry_over_count > 0 && (
                                                    <span
                                                        className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 px-2 py-0.5 text-xs font-medium"
                                                        title={`Carried over ${task.carry_over_count} time(s)`}
                                                    >
                                                        <Repeat size={12} aria-hidden="true" />
                                                        {task.carry_over_count}× carried over
                                                    </span>
                                                )}
                                                <span className="font-medium text-gray-900 dark:text-gray-100 min-w-0 break-words">
                                                    {task.title}
                                                </span>
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                                {task.project && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <span
                                                            className="h-2 w-2 rounded-full bg-gray-400"
                                                            style={task.project_color ? { backgroundColor: task.project_color } : undefined}
                                                            aria-hidden="true"
                                                        />
                                                        {task.project}
                                                    </span>
                                                )}
                                                <span>
                                                    {task.first_task_date === task.task_date
                                                        ? formatDay(task.task_date)
                                                        : `${formatDay(task.first_task_date)} → ${formatDay(task.task_date)}`}
                                                </span>
                                                {task.period_name && <span>{task.period_name}</span>}
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-16 text-center">
                            <ListX className="mx-auto mb-3 text-gray-400" size={32} aria-hidden="true" />
                            <h2 className="font-semibold text-gray-900 dark:text-gray-100">No tasks found</h2>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Try a different search, or clear the status and project filters.
                            </p>
                        </div>
                    )}

                    {tasks.last_page > 1 && (
                        <div className="flex flex-col items-center gap-2">
                            <Pagination links={tasks.links} />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {tasks.total} tasks
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <TaskDetailModal
                isOpen={selectedTask !== null}
                onClose={() => setSelectedTask(null)}
                task={selectedTask}
                periodId={selectedTask?.period_id ?? ''}
            />
        </AuthenticatedLayout>
    );
}
