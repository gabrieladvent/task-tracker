import { motion, AnimatePresence } from 'framer-motion';
import { TasksByDate, CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getPriorityColor } from '@/Pages/Periods/utils';

interface ListViewProps {
    tasksByDate: TasksByDate[];
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
}

export default function ListView({ tasksByDate, onAddTask, onTaskClick }: ListViewProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <AnimatePresence>
                {tasksByDate.map((dateGroup, index) => (
                    <motion.div
                        key={dateGroup.date}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 sm:rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                {dateGroup.day_name}, {dateGroup.formatted_date}
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAddTask(dateGroup.date)}
                                className="flex items-center gap-1 rounded-md bg-gray-800 dark:bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task
                            </motion.button>
                        </div>

                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {dateGroup.tasks.map((task, taskIndex) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: taskIndex * 0.05 }}
                                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                    onClick={() => onTaskClick(task as CalendarTask)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(task.status)} shadow-sm`} />
                                                <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                                                <span className="rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-300">
                                                    {task.story_points ?? 0} pts
                                                </span>
                                            </div>
                                            {task.project && (
                                                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.project}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2 text-xs">
                                                <span className={`font-medium ${getPriorityColor(task.priority)} px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700/50`}>
                                                    {task.priority.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}

                {tasksByDate.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 sm:rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                        <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                            <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            No tasks yet. Click the + button on any date to create your first task.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
