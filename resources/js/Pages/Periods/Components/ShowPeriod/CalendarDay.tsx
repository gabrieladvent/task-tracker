// resources/js/Pages/Periods/Components/ShowPeriod/CalendarDay.tsx
import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { CalendarDay as CalendarDayType, CalendarTask } from '@/Pages/Periods/types/period';
import DraggableTask from './DraggableTask';

interface CalendarDayProps {
    day: CalendarDayType;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
    activeTaskDate?: string | null; // Tambahkan prop ini
}

export default function CalendarDay({ day, onAddTask, onTaskClick, activeTaskDate }: CalendarDayProps) {
    // Check apakah ini tanggal yang sama dengan task yang di-drag
    const isSameDate = activeTaskDate === day.date;

    const { setNodeRef, isOver } = useDroppable({
        id: day.date,
        disabled: !day.is_in_period || isSameDate, // Disable drop jika tanggal sama
        data: { date: day.date }
    });

    // Tentukan style berdasarkan kondisi
    const getDropZoneStyle = () => {
        if (!day.is_in_period) return 'bg-gray-100';
        if (isSameDate && isOver) return 'bg-red-50 ring-2 ring-red-400'; // Visual untuk invalid drop
        if (isSameDate) return 'bg-gray-50 opacity-50'; // Visual untuk tanggal yang sama
        if (isOver) return 'ring-2 ring-green-400 bg-green-50'; // Valid drop zone
        return 'bg-white hover:bg-gray-50';
    };

    return (
        <motion.div
            ref={setNodeRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className={`min-h-32 border p-2 ${getDropZoneStyle()} ${day.is_today
                    ? 'border-2 border-blue-500 shadow-sm'
                    : 'border-gray-200'
                } transition-all duration-200 cursor-default relative`}
        >
            {/* Indicator untuk invalid drop */}
            {isSameDate && isOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-90 z-10 rounded">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <p className="text-xs font-medium text-red-700">Same date!</p>
                    </div>
                </div>
            )}

            {/* Indicator untuk valid drop */}
            {!isSameDate && isOver && day.is_in_period && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-100 bg-opacity-90 z-10 rounded">
                    <div className="text-center">
                        <svg className="mx-auto h-8 w-8 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        <p className="text-xs font-medium text-green-700">Drop to copy</p>
                    </div>
                </div>
            )}

            <div className="mb-1 flex items-center justify-between">
                <div className={`text-sm font-medium ${day.is_today ? 'text-blue-600' : 'text-gray-900'}`}>
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

            {day.is_in_period && day.tasks!.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mt-2 space-y-1"
                >
                    {day.tasks!.slice(0, 3).map((task, index) => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={onTaskClick}
                        />
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
