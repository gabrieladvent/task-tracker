import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { StuckTask, StuckTasks as StuckTasksData } from '../types/dashboard';
import { STATUS_COLOR, STATUS_LABEL } from '../constants/taskStatus';

interface Props {
    stuckTasks: StuckTasksData;
    fadeUp: (delay?: number) => object;
}

/**
 * Work that keeps sliding to tomorrow. Invisible on a daily board — every copy
 * looks like a fresh task — so it only shows up once the chain is counted.
 */
export function StuckTasks({ stuckTasks, fadeUp }: Props) {
    if (stuckTasks.tasks.length === 0) {
        return null;
    }

    return (
        <motion.div
            {...fadeUp(0.15)}
            className="rounded-xl border border-amber-200 dark:border-amber-900/50 bg-white dark:bg-gray-800 overflow-hidden"
        >
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-amber-100 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-900/10">
                <div className="flex items-center gap-2.5">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0" aria-hidden="true" />
                    <div>
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Stuck Tasks</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Still open after rolling over {stuckTasks.threshold} times or more
                        </p>
                    </div>
                </div>
                <span className="shrink-0 rounded-md bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                    {stuckTasks.tasks.length}
                </span>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {stuckTasks.tasks.map((task, index) => (
                    <StuckTaskRow key={task.root_task_id} task={task} index={index} />
                ))}
            </div>
        </motion.div>
    );
}

function StuckTaskRow({ task, index }: { task: StuckTask; index: number }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + index * 0.03 }}
            className="px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
            <div className="flex items-start justify-between gap-3">
                <Link
                    href={route('periods.show', task.period_id)}
                    className="text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                >
                    {task.title}
                </Link>

                <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                        STATUS_COLOR[task.status] ?? STATUS_COLOR.todo
                    }`}
                >
                    {STATUS_LABEL[task.status] ?? task.status}
                </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                    carried over {task.carry_over_count}x
                </span>

                <span>{task.age_days} days old</span>

                {task.days_since_status_change !== null && (
                    <span>
                        {task.days_since_status_change === 0
                            ? 'status moved today'
                            : `same status for ${task.days_since_status_change} days`}
                    </span>
                )}

                {task.project && (
                    <span className="inline-flex items-center gap-1.5">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: task.project.color ?? '#94A3B8' }}
                        />
                        {task.project.name}
                    </span>
                )}
            </div>
        </motion.div>
    );
}
