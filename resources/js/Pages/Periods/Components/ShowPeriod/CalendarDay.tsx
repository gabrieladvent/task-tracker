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
        data: { date: day.date },
    });

    const getCellBg = () => {
        if (!day.is_in_period) return 'bg-gray-50 dark:bg-gray-900/40';
        if (isSameDate && isOver) return 'bg-red-50 dark:bg-red-950/40';
        if (isSameDate) return 'bg-gray-50 dark:bg-gray-900/60 opacity-60';
        if (isOver) return 'bg-emerald-50 dark:bg-emerald-950/40';
        if (day.is_today) return 'bg-blue-50/70 dark:bg-blue-950/30';
        if (isWeekend) return 'bg-slate-50 dark:bg-slate-800/40';
        return 'bg-white dark:bg-slate-800/60 hover:bg-gray-50/80 dark:hover:bg-slate-700/50';
    };

    const getBorderStyle = () => {
        if (day.is_today) return 'border-blue-300 dark:border-blue-600';
        if (isOver && !isSameDate) return 'border-emerald-300 dark:border-emerald-600';
        if (isSameDate && isOver) return 'border-red-300 dark:border-red-600';
        return 'border-gray-100 dark:border-slate-700/60';
    };

    const getDayNumStyle = () => {
        if (!day.is_in_period) return 'text-gray-300 dark:text-gray-700';
        if (day.is_today) return 'text-white bg-blue-500 dark:bg-blue-500';
        if (isWeekend) return 'text-blue-500 dark:text-blue-400';
        return 'text-gray-700 dark:text-gray-200';
    };

    const visibleTasks = day.tasks?.slice(0, 4) ?? [];
    const extraCount = (day.tasks?.length ?? 0) - visibleTasks.length;

    return (
        <motion.div
            ref={setNodeRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={`
                group relative min-h-[110px] border p-2
                ${getCellBg()} ${getBorderStyle()}
                transition-colors duration-150
            `}
        >
            {/* Drop overlay — valid */}
            {isOver && !isSameDate && day.is_in_period && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded-[2px] bg-emerald-50/90 dark:bg-emerald-950/70">
                    <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 3v10m0 0-3-3m3 3 3-3M5 16h10" />
                    </svg>
                    <span className="text-[10px] font-medium text-emerald-700 dark:text-emerald-300">drop to copy</span>
                </div>
            )}

            {/* Drop overlay — invalid */}
            {isOver && isSameDate && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 rounded-[2px] bg-red-50/90 dark:bg-red-950/70">
                    <svg className="h-5 w-5 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
                        <path d="M5 5l10 10M15 5 5 15" />
                    </svg>
                    <span className="text-[10px] font-medium text-red-600 dark:text-red-300">same date</span>
                </div>
            )}

            {/* Day header */}
            <div className="mb-1.5 flex items-center justify-between">
                <span className={`
                    inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium leading-none
                    ${getDayNumStyle()}
                `}>
                    {day.day}
                </span>

                <div className="flex items-center gap-1">
                    {day.is_in_period && day.tasks_count > 0 && (
                        <span className="rounded-full border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-px text-[10px] leading-none">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{day.completed_count}</span>
                            <span className="text-gray-400 dark:text-gray-500">/{day.tasks_count}</span>
                        </span>
                    )}
                    {day.is_in_period && (
                        <button
                            onClick={() => onAddTask(day.date)}
                            title="Add task"
                            className="flex h-4 w-4 items-center justify-center rounded-full text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                                <path d="M6 1v10M1 6h10" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks */}
            {day.is_in_period && visibleTasks.length > 0 && (
                <div className="space-y-[3px]">
                    {visibleTasks.map((task, index) => (
                        <DraggableTask
                            key={task.id}
                            task={task}
                            index={index}
                            onClick={onTaskClick}
                        />
                    ))}
                    {extraCount > 0 && (
                        <div className="rounded bg-gray-50 dark:bg-slate-700/50 px-1.5 py-0.5 text-center text-[10px] text-gray-400 dark:text-gray-500">
                            +{extraCount} more
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
}
