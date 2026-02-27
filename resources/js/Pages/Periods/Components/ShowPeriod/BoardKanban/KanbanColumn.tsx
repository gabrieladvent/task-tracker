import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';
import { BoardColumn, CalendarTask } from '@/Pages/Periods/types/period';
import { STATUS_CONFIG } from './config';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
    column: BoardColumn;
    projectColorMap: Map<string, string>;
    onTaskClick: (task: CalendarTask) => void;
    onAddTask: (date: string) => void;
}

export default function KanbanColumn({ column, projectColorMap, onTaskClick, onAddTask }: KanbanColumnProps) {
    const today = new Date().toISOString().split('T')[0];
    const cfg = STATUS_CONFIG[column.status] ?? { label: column.label, icon: '○', accent: '#94a3b8', ring: 'ring-gray-300' };

    const { setNodeRef, isOver } = useDroppable({
        id: `col-${column.status}`,
        data: { status: column.status },
    });

    const taskIds = column.tasks.map(t => t.id);
    const totalPoints = column.tasks.reduce((sum, t) => sum + (t.story_points ?? 0), 0);

    return (
        <div className="flex-shrink-0 w-64 xl:w-72 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className="text-base font-bold" style={{ color: cfg.accent }}>{cfg.icon}</span>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 tracking-tight">{cfg.label}</h3>
                    <span className="text-xs font-bold tabular-nums px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: cfg.accent }}>
                        {column.tasks.length}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {totalPoints > 0 && (
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">{totalPoints}pt total</span>
                    )}
                    <button
                        onClick={() => onAddTask(today)}
                        className="flex items-center justify-center h-6 w-6 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 dark:hover:bg-slate-600 transition-colors"
                        title="Add task"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Drop zone */}
            <div
                ref={setNodeRef}
                className={`flex-1 rounded-2xl p-2 space-y-2 min-h-[120px] overflow-y-auto transition-all duration-200
                    ${isOver
                        ? `ring-2 ring-inset scale-[1.01] ${cfg.ring} bg-blue-50/60 dark:bg-blue-900/10`
                        : 'bg-gray-50/80 dark:bg-slate-900/40'
                    }`}
            >
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <AnimatePresence initial={false}>
                        {column.tasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.03, duration: 0.2 }}
                            >
                                <TaskCard
                                    task={task}
                                    projectColor={projectColorMap.get(task.project_id || '__no_project__') ?? '#94a3b8'}
                                    onClick={() => onTaskClick(task)}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {column.tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <span className="text-3xl mb-2 opacity-20" style={{ color: cfg.accent }}>{cfg.icon}</span>
                            <p className="text-xs text-gray-400 dark:text-slate-600">Drop tasks here</p>
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
}
