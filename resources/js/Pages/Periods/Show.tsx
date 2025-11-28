import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Props, CalendarTask, NewTaskData } from '@/Pages/Periods/types/period';
import CalendarView from '@/Pages/Periods/Components/ShowPeriod/CalendarView';
import ListView from '@/Pages/Periods/Components/ShowPeriod/ListView';
import ViewToggle from '@/Pages/Periods/Components/ShowPeriod/ViewToggle';
import TaskModal from '@/Pages/Periods/Components/ShowPeriod/TaskModal';
import TaskDetailModal from '@/Pages/Periods/Components/ShowPeriod/TaskDetailModal';
import { motion } from 'framer-motion';

export default function ShowPeriod({ period, tasksByDate, calendarData }: Props) {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [newTask, setNewTask] = useState<NewTaskData>({
        title: '',
        description: '',
        status: 'todo',
        priority: 'low',
        story_points: '',
    });

    const openNewTaskModal = (date: string) => {
        setSelectedDate(date);
        setNewTask({
            title: '',
            description: '',
            status: 'todo',
            priority: 'low',
            story_points: '',
        });
        setShowTaskModal(true);
    };

    const openDetailModal = (task: CalendarTask) => {
        setSelectedTask({ ...task });
        setShowDetailModal(true);
    };

    const closeModals = () => {
        setShowTaskModal(false);
        setShowDetailModal(false);
        setSelectedTask(null);
        setSelectedDate('');
    };

    const handleNewTaskChange = (updates: Partial<NewTaskData>) => {
        setNewTask(prev => ({ ...prev, ...updates }));
    };

    return (
        <AuthenticatedLayout>
            <Head title={period.name} />

            <div className="flex items-center justify-between px-10 mt-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        {period.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                        {period.start_date} - {period.end_date}
                    </p>
                </motion.div>

                <ViewToggle view={view} onViewChange={setView} />
            </div>

            <div className="w-full py-10">
                <div className="mx-auto w-full px-4 sm:px-6 lg:px-8">
                    {/* Calendar View */}
                    {view === 'calendar' && (
                        <CalendarView
                            calendarData={calendarData}
                            onAddTask={openNewTaskModal}
                            onTaskClick={openDetailModal}
                        />
                    )}

                    {/* List View */}
                    {view === 'list' && (
                        <ListView
                            tasksByDate={tasksByDate}
                            onAddTask={openNewTaskModal}
                            onTaskClick={openDetailModal}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <TaskModal
                isOpen={showTaskModal}
                onClose={closeModals}
                selectedDate={selectedDate}
                newTask={newTask}
                onNewTaskChange={handleNewTaskChange}
                periodId={period.id}
            />

            <TaskDetailModal
                isOpen={showDetailModal}
                onClose={closeModals}
                task={selectedTask}
                periodId={period.id}
            />
        </AuthenticatedLayout>
    );
}
