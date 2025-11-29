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
            className={`group relative rounded px-1.5 py-1 text-xs ${getStatusBadgeColor(task.status)} hover:opacity-80 transition-all duration-200 cursor-grab active:cursor-grabbing transform hover:scale-[1.02] ${isDragging ? 'opacity-30 z-50 ring-2 ring-blue-400' : ''
                }`}
            onClick={(e) => {
                if (!isDragging) {
                    e.stopPropagation();
                    onClick(task);
                }
            }}
            title={`${task.title} - Drag to copy to another date`}
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
    );
}
