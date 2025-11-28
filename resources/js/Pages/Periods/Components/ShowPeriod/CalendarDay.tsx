import { motion } from 'framer-motion';
import { CalendarDay as CalendarDayType, CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getStatusBadgeColor, truncateText } from '@/Pages/Periods/utils';

interface CalendarDayProps {
    day: CalendarDayType;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
}

export default function CalendarDay({ day, onAddTask, onTaskClick }: CalendarDayProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`min-h-32 border p-2 ${day.is_in_period
                    ? 'bg-white hover:bg-gray-50'
                    : 'bg-gray-100'
                } ${day.is_today
                    ? 'border-2 border-blue-500 shadow-sm'
                    : 'border-gray-200'
                } transition-all duration-200 cursor-default`}
        >
            <div className="mb-1 flex items-center justify-between">
                <div className={`text-sm font-medium ${day.is_today ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                    {day.day}
                </div>
                <div className="flex items-center gap-1">
                    {day.is_in_period && day.tasks_count > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-xs text-gray-600"
                        >
                            <span className="font-semibold text-green-600">
                                {day.completed_count}
                            </span>
                            /{day.tasks_count}
                        </motion.div>
                    )}
                    {day.is_in_period && (
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onAddTask(day.date)}
                            className="flex h-5 w-5 items-center justify-center rounded hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                            title="Add task"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Task List */}
            {day.is_in_period && day.tasks!.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 space-y-1"
                >
                    {day.tasks!.slice(0, 3).map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className={`group relative rounded px-1.5 py-1 text-xs ${getStatusBadgeColor(task.status)} hover:opacity-80 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]`}
                            onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(task);
                            }}
                            title={task.title}
                        >
                            <div className="flex items-start gap-1">
                                <span className={`mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${getStatusColor(task.status)}`} />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate font-medium">
                                        {truncateText(task.title, 20)}
                                    </div>
                                    {task.project && (
                                        <div className="truncate text-[10px] opacity-75">
                                            {task.project}
                                        </div>
                                    )}
                                </div>
                                {task.story_points && (
                                    <span className="flex-shrink-0 text-[10px] font-semibold">
                                        {task.story_points}
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {day.tasks!.length > 3 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-1.5 text-[10px] text-gray-500"
                        >
                            +{day.tasks!.length - 3} more
                        </motion.div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
