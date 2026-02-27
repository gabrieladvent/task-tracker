import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { BoardTask } from '@/Pages/Periods/types/period';
import { getPriorityBadgeColor } from '@/Pages/Periods/utils';

interface TaskCardProps {
    task: BoardTask;
    projectColor: string;
    onClick: () => void;
}

export default function TaskCard({ task, projectColor, onClick }: TaskCardProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: task.id,
        data: task,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
                opacity: isDragging ? 0.3 : 1,
            }}
            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none"
            onClick={onClick}
            {...attributes}
            {...listeners}
        >
            {/* Project color bar */}
            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: projectColor }} />

            <div className="pl-4 pr-3 py-3 space-y-2">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 pr-1">
                    {task.title}
                </p>

                {task.project_name && (
                    <div className="flex items-center gap-1.5">
                        <span className="inline-block h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: projectColor }} />
                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{task.project_name}</span>
                    </div>
                )}

                <div className="flex items-center justify-between gap-2 pt-0.5">
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${getPriorityBadgeColor(task.priority)}`}>
                        {task.priority}
                    </span>
                    {task.story_points !== null && (
                        <span className="text-[10px] font-mono font-bold text-gray-400 dark:text-slate-500 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                            {task.story_points}pt
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500">
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {task.task_date}
                </div>
            </div>

            {/* Drag handle hint */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-30 transition-opacity">
                <svg className="h-3.5 w-3.5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="9" cy="6" r="1.5" /><circle cx="15" cy="6" r="1.5" />
                    <circle cx="9" cy="12" r="1.5" /><circle cx="15" cy="12" r="1.5" />
                    <circle cx="9" cy="18" r="1.5" /><circle cx="15" cy="18" r="1.5" />
                </svg>
            </div>
        </div>
    );
}
