import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { router } from '@inertiajs/react';
import { BoardColumn, BoardData, BoardTask, CalendarTask } from '@/Pages/Periods/types/period';
import toast from 'react-hot-toast';
import { STATUS_CONFIG } from './config';
import { useProjectColors } from './useProjectColors';
import KanbanColumn from './KanbanColumn';
import ProjectFilter from './ProjectFilter';
import StatsBar from './StatsBar';

interface BoardKanbanProps {
    boardData: BoardData;
    onTaskClick: (task: CalendarTask) => void;
    onAddTask: (date: string) => void;
}

function DragOverlayCard({ task, projectColor }: { task: BoardTask; projectColor: string }) {
    return (
        <div className="w-64 relative bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-400 shadow-2xl rotate-3 scale-105 pl-4 pr-3 py-3 space-y-1">
            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: projectColor }} />
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">{task.title}</p>
            {task.project_name && (
                <div className="flex items-center gap-1.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: projectColor }} />
                    <span className="text-xs text-gray-500 dark:text-gray-400">{task.project_name}</span>
                </div>
            )}
        </div>
    );
}

export default function BoardKanban({ boardData, onTaskClick, onAddTask }: BoardKanbanProps) {
    const [columns, setColumns] = useState<BoardColumn[]>(boardData.columns);
    const [activeTask, setActiveTask] = useState<BoardTask | null>(null);
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const allTasks = useMemo(() => columns.flatMap(c => c.tasks), [columns]);
    const projectColorMap = useProjectColors(allTasks);

    const filteredColumns = useMemo(() => {
        if (activeFilter === null) return columns;
        return columns.map(col => ({
            ...col,
            tasks: col.tasks.filter(t => (t.project_id || '__no_project__') === activeFilter),
        }));
    }, [columns, activeFilter]);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTask(event.active.data.current as BoardTask);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);
        if (!over) return;

        const overId = over.id as string;
        let targetStatus: string | null = overId.startsWith('col-')
            ? overId.replace('col-', '')
            : columns.find(col => col.tasks.find(t => t.id === overId))?.status ?? null;

        if (!targetStatus) return;

        const task = active.data.current as BoardTask;
        if (task.status === targetStatus) return;

        setColumns(prev => prev.map(col => {
            if (col.status === task.status) return { ...col, tasks: col.tasks.filter(t => t.id !== task.id) };
            if (col.status === targetStatus) return { ...col, tasks: [...col.tasks, { ...task, status: targetStatus! }] };
            return col;
        }));

        router.put(`/tasks/${task.id}`, { status: targetStatus }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Moved to "${STATUS_CONFIG[targetStatus!]?.label ?? targetStatus}"`, {
                duration: 2000, position: 'top-center', icon: '✅',
                style: { borderRadius: '10px', background: '#efe', color: '#060' },
            }),
            onError: () => {
                setColumns(boardData.columns);
                toast.error('Failed to update status', { duration: 2000, position: 'top-center' });
            },
        });
    };

    const doneTasks = columns.find(c => c.status === 'done')?.tasks.length ?? 0;

    return (
        <div className="space-y-4">
            <StatsBar totalTasks={allTasks.length} doneTasks={doneTasks} />

            <ProjectFilter
                tasks={allTasks}
                colorMap={projectColorMap}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveTask(null)}
            >
                <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 snap-x snap-mandatory h-[calc(100vh-280px)]">
                    {filteredColumns.map((column, idx) => (
                        <motion.div
                            key={column.status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.06, duration: 0.3 }}
                            className="snap-start"
                        >
                            <KanbanColumn
                                column={column}
                                projectColorMap={projectColorMap}
                                onTaskClick={onTaskClick}
                                onAddTask={onAddTask}
                            />
                        </motion.div>
                    ))}
                </div>

                <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
                    {activeTask && (
                        <DragOverlayCard
                            task={activeTask}
                            projectColor={projectColorMap.get(activeTask.project_id || '__no_project__') ?? '#94a3b8'}
                        />
                    )}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
