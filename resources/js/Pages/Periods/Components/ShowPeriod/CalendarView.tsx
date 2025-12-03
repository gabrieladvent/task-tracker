import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { CalendarData, CalendarTask } from '@/Pages/Periods/types/period';
import CalendarDay from './CalendarDay';
import GenerateReportModal from '@/Pages/Periods/Components/ShowPeriod/GenerateReportModal';
import toast from 'react-hot-toast';

interface CalendarViewProps {
    calendarData: CalendarData;
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
    periodId: string;
    periodName: string;
}

export default function CalendarView({ calendarData, onAddTask, onTaskClick, periodId, periodName }: CalendarViewProps) {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const [activeTask, setActiveTask] = useState<CalendarTask | null>(null);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const task = event.active.data.current as CalendarTask;
        setActiveTask(task);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.data.current && over.data.current) {
            const task = active.data.current as CalendarTask;
            const targetDate = over.data.current.date as string;

            // Validasi: Cegah drop ke tanggal yang sama
            if (task.task_date === targetDate) {
                toast.error('Cannot copy task to the same date!', {
                    duration: 2000,
                    position: 'top-center',
                    icon: '❌',
                    style: {
                        borderRadius: '10px',
                        background: '#fee',
                        color: '#c00',
                    },
                });
                setActiveTask(null);
                return;
            }

            // Copy task ke tanggal baru
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
                onSuccess: () => {
                    toast.success('Task copied successfully!', {
                        duration: 2000,
                        position: 'top-center',
                        icon: '✅',
                        style: {
                            borderRadius: '10px',
                            background: '#efe',
                            color: '#060',
                        },
                    });
                },
                onError: () => {
                    toast.error('Failed to copy task', {
                        duration: 2000,
                        position: 'top-center',
                    });
                }
            });
        }

        setActiveTask(null);
    };

    const handleDragCancel = () => {
        setActiveTask(null);
    };

    return (
        <>
            <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden bg-white shadow-sm sm:rounded-lg"
                >
                    <div className="p-6">

                        {/* Generate Report Button */}
                        <div className="mb-4 flex justify-end">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowGenerateModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Generate Report
                            </motion.button>
                        </div>

                        {/* Info Banner */}
                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                            <svg className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-sm text-blue-800">
                                <strong>Tip:</strong> Drag and drop tasks to copy them to different dates
                            </p>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {daysOfWeek.map((day) => (
                                <motion.div
                                    key={day}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="p-2 text-center text-xs font-medium text-gray-500"
                                >
                                    {day}
                                </motion.div>
                            ))}

                            {calendarData.weeks.map((week, weekIdx) => (
                                week.map((day, dayIdx) => (
                                    <CalendarDay
                                        key={`${weekIdx}-${dayIdx}`}
                                        day={day}
                                        onAddTask={onAddTask}
                                        onTaskClick={onTaskClick}
                                        activeTaskDate={activeTask?.task_date ?? null}
                                    />
                                ))
                            ))}
                        </div>
                    </div>
                </motion.div>

                <DragOverlay>
                    {activeTask ? (
                        <div className="bg-white rounded px-3 py-2 shadow-2xl border-2 border-blue-400 transform rotate-3">
                            <div className="text-sm font-medium text-gray-900">{activeTask.title}</div>
                            {activeTask.project && (
                                <div className="text-xs text-gray-600 mt-1">{activeTask.project}</div>
                            )}
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <GenerateReportModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                periodId={periodId}
                periodName={periodName}
            />
        </>
    );
}
