import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarData, CalendarTask } from '@/Pages/Periods/types/period';
import CalendarDay from './CalendarDay';
import toast from 'react-hot-toast';

interface CalendarViewProps {
    calendarData: CalendarData;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
    periodId: string;
    periodName: string;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarView({ calendarData, onAddTask, onTaskClick, periodId }: CalendarViewProps) {
    const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveTask(event.active.data.current as CalendarTask);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.data.current && over.data.current) {
            const task = active.data.current as CalendarTask;
            const targetDate = over.data.current.date as string;

            if (task.task_date === targetDate) {
                toast.error('Task is already on this date', {
                    duration: 2000,
                    position: 'top-center',
                    style: { borderRadius: '8px', fontSize: '13px' },
                });
                setActiveTask(null);
                return;
            }

            router.post(`/periods/${periodId}/tasks`, {
                task_date: targetDate,
                title: task.title,
                description: task.description,
                status: task.status,
                priority: task.priority,
                story_points: task.story_points,
                project_id: task.project_id,
                notes: task.notes,
                link_pull_request: task.link_pull_request,
            }, {
                preserveScroll: true,
                onSuccess: () => toast.success('Task copied', {
                    duration: 2000,
                    position: 'top-center',
                    style: { borderRadius: '8px', fontSize: '13px' },
                }),
                onError: () => toast.error('Failed to copy task', {
                    duration: 2000,
                    position: 'top-center',
                }),
            });
        }

        setActiveTask(null);
    };

    return (
        <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTask(null)}
        >
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden rounded-xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800/90 shadow-sm"
            >
                {/* Day-of-week header */}
                <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700 bg-gray-50/60 dark:bg-slate-900/40">
                    {DAYS_OF_WEEK.map((day) => (
                        <div
                            key={day}
                            className="py-2.5 text-center text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500"
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7">
                    {calendarData.weeks.map((week, weekIdx) =>
                        week.map((day, dayIdx) => (
                            <CalendarDay
                                key={`${weekIdx}-${dayIdx}`}
                                day={day}
                                onAddTask={onAddTask}
                                onTaskClick={onTaskClick}
                                activeTaskDate={activeTask?.task_date ?? null}
                            />
                        ))
                    )}
                </div>
            </motion.div>

            <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
                {activeTask && (
                    <div className="rotate-1 rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-slate-800 px-3 py-2 shadow-lg">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-100 truncate max-w-[160px]">
                            {activeTask.title}
                        </p>
                        {activeTask.project && (
                            <p className="mt-0.5 text-[10px] text-gray-400 dark:text-gray-500 truncate">
                                {activeTask.project}
                            </p>
                        )}
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    );
}
