// resources/js/Pages/Periods/Components/ShowPeriod/DraggableTask.tsx
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusBadgeColor, getStatusColor, truncateText } from '@/Pages/Periods/utils';

interface DraggableTaskProps {
    task: CalendarTask;
    index: number;
    onClick: (task: CalendarTask) => void;
}

export default function DraggableTask({ task, index, onClick }: DraggableTaskProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task.id,
        data: task
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative rounded-md px-2 py-1.5 text-xs ${getStatusBadgeColor(task.status)} hover:opacity-90 dark:hover:opacity-80 transition-all duration-200 cursor-grab active:cursor-grabbing transform hover:scale-[1.02] hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-gray-900/30 ${isDragging
                    ? 'opacity-30 z-50 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg dark:shadow-blue-900/50'
                    : ''
                }`}
            onClick={(e) => {
                if (!isDragging) {
                    e.stopPropagation();
                    onClick(task);
                }
            }}
            title={`${task.title} - Drag to copy to another date`}
        >
            <div className="flex items-start gap-1.5">
                {/* Status indicator dot */}
                <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${getStatusColor(task.status)} shadow-sm`} />

                {/* Task content */}
                <div className="min-w-0 flex-1">
                    <div className="truncate font-medium leading-tight">
                        {truncateText(task.title, 20)}
                    </div>
                    {task.project && (
                        <div className="mt-0.5 truncate text-[10px] opacity-75 dark:opacity-60">
                            {task.project}
                        </div>
                    )}
                </div>

                {/* Story points badge */}
                {task.story_points && (
                    <span className="flex-shrink-0 rounded bg-white/50 dark:bg-black/20 px-1.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
                        {task.story_points}
                    </span>
                )}
            </div>

            {/* Drag indicator (subtle) */}
            {!isDragging && (
                <div className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 dark:group-hover:opacity-30 transition-opacity pointer-events-none">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 16 16">
                        <circle cx="3" cy="5" r="1" />
                        <circle cx="3" cy="8" r="1" />
                        <circle cx="3" cy="11" r="1" />
                        <circle cx="6" cy="5" r="1" />
                        <circle cx="6" cy="8" r="1" />
                        <circle cx="6" cy="11" r="1" />
                    </svg>
                </div>
            )}
        </motion.div>
    );
}
