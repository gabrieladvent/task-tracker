import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Props, CalendarTask } from '@/Pages/Periods/types/period';
import CalendarView from '@/Pages/Periods/Components/ShowPeriod/CalendarView';
import ListView from '@/Pages/Periods/Components/ShowPeriod/ListView';
import ViewToggle from '@/Pages/Periods/Components/ShowPeriod/ViewToggle';
import TaskDetailModal from '@/Pages/Periods/Components/ShowPeriod/TaskDetailModal';
import { motion } from 'framer-motion';
import GenerateReportModal from '@/Pages/Periods/Components/ShowPeriod/GenerateReportModal';
import BoardKanban from './Components/ShowPeriod/BoardKanban';
import GenerateTaskModal from './Components/ShowPeriod/GenerateTaskModal';

export default function ShowPeriod({ period, tasksByDate, calendarData, boardData }: Props) {
    const [view, setView] = useState<'calendar' | 'list' | 'board'>('calendar');
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
    const [isNewTask, setIsNewTask] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [showGenerateTaskModal, setShowGenerateTaskModal] = useState(false);
    const { app } = usePage().props as any;
    const isDev = app.env === 'local';

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

            {/* ── Header ── */}
            <div className="px-10 mt-10 mb-6 space-y-3">
                {/* Row 1: title + date */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-100">
                        {period.name}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                        {period.start_date} - {period.end_date}
                    </p>
                </motion.div>

                {/* Row 2: Generate Report and Task + ViewToggle */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowGenerateModal(true)}
                            className="flex items-center gap-2 rounded-lg bg-gray-800 dark:bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-slate-600 transition-colors"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Generate Report
                        </motion.button>

                        {isDev && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowGenerateTaskModal(true)}
                                className="flex items-center gap-2 rounded-lg bg-white dark:bg-transparent border border-gray-300 dark:border-slate-500 px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Generate Task
                            </motion.button>
                        )}
                    </div>


                    <ViewToggle view={view} onViewChange={setView} />
                </div>
            </div>

            {/* ── Content ── */}
            <div className="w-full px-4 sm:px-6 lg:px-8 pb-10">
                {view === 'calendar' && (
                    <CalendarView
                        calendarData={calendarData}
                        onAddTask={openNewTaskModal}
                        onTaskClick={openDetailModal}
                        periodId={period.id}
                        periodName={period.name}
                    />
                )}

                {view === 'list' && (
                    <ListView
                        tasksByDate={tasksByDate}
                        onAddTask={openNewTaskModal}
                        onTaskClick={openDetailModal}
                    />
                )}

                {view === 'board' && (
                    <BoardKanban
                        boardData={boardData}
                        onTaskClick={openDetailModal}
                        onAddTask={openNewTaskModal}
                    />
                )}
            </div>

            <TaskDetailModal
                isOpen={showDetailModal}
                onClose={closeModals}
                task={selectedTask}
                periodId={period.id}
                isNewTask={isNewTask}
            />

            <GenerateReportModal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                periodId={period.id}
                periodName={period.name}
            />

            {isDev && (
                <GenerateTaskModal
                    isOpen={showGenerateTaskModal}
                    onClose={() => setShowGenerateTaskModal(false)}
                    periodId={period.id}
                />
            )}
        </AuthenticatedLayout>
    );
}
