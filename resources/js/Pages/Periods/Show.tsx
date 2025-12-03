import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Props, CalendarTask } from '@/Pages/Periods/types/period';
import CalendarView from '@/Pages/Periods/Components/ShowPeriod/CalendarView';
import ListView from '@/Pages/Periods/Components/ShowPeriod/ListView';
import ViewToggle from '@/Pages/Periods/Components/ShowPeriod/ViewToggle';
import TaskDetailModal from '@/Pages/Periods/Components/ShowPeriod/TaskDetailModal';
import { motion } from 'framer-motion';

export default function ShowPeriod({ period, tasksByDate, calendarData }: Props) {
    const [view, setView] = useState<'calendar' | 'list'>('calendar');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
    const [isNewTask, setIsNewTask] = useState(false);

    const openNewTaskModal = (date: string) => {
        const emptyTask: CalendarTask = {
            id: 'new',
            title: '',
            description: '',
            status: 'todo',
            priority: 'low',
            story_points: null,
            project_id: '',
            notes: '',
            link_pull_request: '',
            task_date: date,
            project: null
        };

        setSelectedTask(emptyTask);
        setIsNewTask(true);
        setShowDetailModal(true);
    };

    const openDetailModal = (task: CalendarTask) => {
        setSelectedTask({ ...task });
        setIsNewTask(false);
        setShowDetailModal(true);
    };

    const closeModals = () => {
        setShowDetailModal(false);
        setSelectedTask(null);
        setIsNewTask(false);
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
                            periodId={period.id}
                            periodName={period.name}
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

            {/* Task Detail Modal - dengan mode create/edit */}
            <TaskDetailModal
                isOpen={showDetailModal}
                onClose={closeModals}
                task={selectedTask}
                periodId={period.id}
                isNewTask={isNewTask}
            />
        </AuthenticatedLayout>
    );
}
