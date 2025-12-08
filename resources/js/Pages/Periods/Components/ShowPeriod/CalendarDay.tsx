// resources/js/Pages/Periods/Components/ShowPeriod/CalendarDay.tsx
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CalendarDay as CalendarDayType, CalendarTask } from '@/Pages/Periods/types/period';
import DraggableTask from './DraggableTask';

interface CalendarDayProps {
    day: CalendarDayType;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
    activeTaskDate?: string | null;
}

export default function CalendarDay({ day, onAddTask, onTaskClick, activeTaskDate }: CalendarDayProps) {
    const isSameDate = activeTaskDate === day.date;

    const dayOfWeek = new Date(day.date).getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    const { setNodeRef, isOver } = useDroppable({
        id: day.date,
        disabled: !day.is_in_period || isSameDate,
        data: { date: day.date }
    });

    const getDropZoneStyle = () => {
        if (!day.is_in_period) return 'bg-gray-50 dark:bg-gray-800/50';

        if (isSameDate && isOver) return 'bg-red-50 dark:bg-red-900/40 ring-2 ring-red-400 dark:ring-red-500';

        if (isSameDate) return 'bg-gray-50 dark:bg-gray-800 opacity-50';

        if (isOver) return 'ring-2 ring-green-400 dark:ring-green-500 bg-green-50 dark:bg-green-900/40';

        if (isWeekend) return 'bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/60 dark:hover:bg-blue-950/30';

        return 'bg-white dark:bg-gray-900/50 hover:bg-gray-50 dark:hover:bg-gray-800/70';
    };

    const getDayNumberColor = () => {
        if (day.is_today) return 'text-blue-600 dark:text-blue-400 font-bold';
        if (isWeekend) return 'text-blue-600 dark:text-blue-400';
        return 'text-gray-900 dark:text-gray-100';
    };

    return (
        <motion.div
            ref={setNodeRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`min-h-32 border p-2 ${getDropZoneStyle()} ${day.is_today
                ? 'border-2 border-blue-500 dark:border-blue-400 shadow-md dark:shadow-blue-900/20'
                : isWeekend
                    ? 'border-blue-200 dark:border-blue-900/40'
                    : 'border-gray-200 dark:border-gray-700'
                } transition-all duration-200 cursor-default relative`}
        >
            {/* Indicator untuk invalid drop */}
            {isSameDate && isOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 dark:bg-red-900/90 bg-opacity-90 z-10 rounded">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-red-500 dark:text-red-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-xs font-medium text-red-700 dark:text-red-200">Same date!</p>
                    </div>
                </div>
            )}

            {/* Indicator untuk valid drop */}
            {!isSameDate && isOver && day.is_in_period && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900/90 bg-opacity-90 z-10 rounded">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-green-500 dark:text-green-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <p className="text-xs font-medium text-green-700 dark:text-green-200">Drop to copy</p>
                    </div>
                </div>
            )}

            <div className="mb-1 flex items-center justify-between">
                <div className={`text-sm font-semibold ${getDayNumberColor()}`}>
                    {day.day}
                </div>
                <div className="flex items-center gap-1.5">
                    {day.is_in_period && day.tasks_count > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="rounded-full bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 text-[10px] font-bold"
                        >
                            <span className="text-green-600 dark:text-green-400">
                                {day.completed_count}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400">
                                /{day.tasks_count}
                            </span>
                        </motion.div>
                    )}
                    {day.is_in_period && (
                        <motion.button
                            whileHover={{ scale: 1.15, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onAddTask(day.date)}
                            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-all"
                            title="Add task"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                        </motion.button>
                    )}
                </div>
            </div>

            {day.is_in_period && day.tasks!.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 space-y-1"
                >
                    {day.tasks!.slice(0, 4).map((task, index) => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={onTaskClick}
                        />
                    ))}
                    {day.tasks!.length > 4 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="px-2 py-1 text-[10px] font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded text-center"
                        >
                            +{day.tasks!.length - 4} more tasks
                        </motion.div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
