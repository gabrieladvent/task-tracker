import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PeriodStats, TodayTask } from '../types/dashboard';
import { STATUS_COLOR, STATUS_LABEL } from '../constants/taskStatus';

interface Props {
    currentPeriod: PeriodStats | null;
    todayTasks: TodayTask[];
    fadeUp: (delay?: number) => object;
}

export function TodayTaskList({ currentPeriod, todayTasks, fadeUp }: Props) {
    const doneTodayCount = todayTasks.filter(t => t.status === 'done').length;
    const pendingTodayCount = todayTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length;

    return (
        <motion.div
            {...fadeUp(0.1)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden"
        >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                    <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Today's Tasks</h2>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {doneTodayCount} done · {pendingTodayCount} remaining
                    </p>
                </div>
                {currentPeriod && (
                    <Link
                        href={route('periods.show', currentPeriod.id)}
                        className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                        View all →
                    </Link>
                )}
            </div>

            {todayTasks.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
                    No tasks for today yet.
                </div>
            ) : (
                <div className="divide-y divide-gray-50 dark:divide-gray-700/50">
                    {todayTasks.slice(0, 8).map((task, i) => (
                        <TaskRow key={task.id} task={task} index={i} />
                    ))}
                    {todayTasks.length > 8 && (
                        <div className="px-6 py-3 text-xs text-gray-400 dark:text-gray-500 text-center">
                            +{todayTasks.length - 8} more tasks
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}

interface TaskRowProps {
    task: TodayTask;
    index: number;
}

function TaskRow({ task, index }: TaskRowProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 + index * 0.03 }}
            className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
        >
            {/* Priority dot */}
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-gray-300'
                }`} />

            <div className="flex-1 min-w-0">
                <p className={`text-sm truncate ${task.status === 'done'
                        ? 'line-through text-gray-400'
                        : 'text-gray-800 dark:text-gray-200'
                    }`}>
                    {task.title}
                </p>
                {task.project_name && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        {task.project_name}
                    </p>
                )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {task.is_carry_over && (
                    <span className="text-[10px] text-amber-500 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full font-medium">
                        carry-over
                    </span>
                )}
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[task.status] ?? STATUS_COLOR.todo}`}>
                    {STATUS_LABEL[task.status] ?? task.status}
                </span>
            </div>
        </motion.div>
    );
}
