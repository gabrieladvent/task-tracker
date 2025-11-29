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
                        className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                    >
                        <div className="border-b border-gray-200 bg-gray-50 p-4 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">
                                {dateGroup.day_name}, {dateGroup.formatted_date}
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAddTask(dateGroup.date)}
                                className="flex items-center gap-1 rounded-md bg-gray-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                            >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Task
                            </motion.button>
                        </div>

                        <div className="divide-y divide-gray-200">
                            {dateGroup.tasks.map((task, taskIndex) => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: taskIndex * 0.05 }}
                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => onTaskClick(task as CalendarTask)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
                                                <h4 className="font-medium text-gray-900">{task.title}</h4>
                                                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                                                        {task.story_points ?? 0} pts
                                                    </span>
                                            </div>
                                            {task.project && (
                                                <p className="mt-1 text-sm text-gray-600">{task.project}</p>
                                            )}
                                            <div className="mt-2 flex items-center gap-2 text-xs">
                                                <span className={`font-medium ${getPriorityColor(task.priority)} p-1 rounded`}>
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
                        className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                    >
                        <div className="p-12 text-center text-gray-500">
                            No tasks yet. Click the + button on any date to create your first task.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
