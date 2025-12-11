import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { TasksByDate, CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getPriorityColor } from '@/Pages/Periods/utils';

interface ListViewProps {
    tasksByDate: TasksByDate[];
    onAddTask: (date: string) => void;
    onTaskClick: (task: CalendarTask) => void;
}

export default function ListView({ tasksByDate, onAddTask, onTaskClick }: ListViewProps) {
    const today = useMemo(() => {
        const now = new Date();
        return now.toISOString().split('T')[0];
    }, []);

    const [collapsedDates, setCollapsedDates] = useState<Set<string>>(() => {
        const collapsed = new Set<string>();
        tasksByDate.forEach(dateGroup => {
            if (dateGroup.date !== today) {
                collapsed.add(dateGroup.date);
            }
        });
        return collapsed;
    });

    const toggleCollapse = (date: string) => {
        setCollapsedDates(prev => {
            const newSet = new Set(prev);
            if (newSet.has(date)) {
                newSet.delete(date);
            } else {
                newSet.add(date);
            }
            return newSet;
        });
    };

    const collapsedItems = tasksByDate.filter(d => collapsedDates.has(d.date));
    const expandedItems = tasksByDate.filter(d => !collapsedDates.has(d.date));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
        >
            {/* COLLAPSED ITEMS - GRID LAYOUT */}
            {collapsedItems.length > 0 && (
                <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3"
                >
                    <AnimatePresence>
                        {collapsedItems.map((dateGroup, index) => (
                            <motion.div
                                key={dateGroup.date}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.03 }}
                                className="overflow-hidden bg-white dark:bg-slate-800/90 shadow-sm dark:shadow-slate-900/30 rounded-lg border border-gray-200 dark:border-slate-700 cursor-pointer hover:shadow-md hover:border-gray-300 dark:hover:border-slate-600 transition-all"
                                onClick={() => toggleCollapse(dateGroup.date)}
                            >
                                <div className="p-3 bg-gray-50 dark:bg-slate-900/60">
                                    <div className="flex items-center gap-2 mb-2">
                                        <motion.svg
                                            className="h-4 w-4 text-gray-400 dark:text-gray-500"
                                            animate={{ rotate: 0 }}
                                            transition={{ duration: 0.3 }}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </motion.svg>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                            {dateGroup.day_name}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                        {dateGroup.formatted_date}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/50 px-2 py-1 rounded-full">
                                            {dateGroup.tasks.length} {dateGroup.tasks.length === 1 ? 'task' : 'tasks'}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddTask(dateGroup.date);
                                            }}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        >
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* EXPANDED ITEMS - FULL WIDTH LIST */}
            <AnimatePresence>
                {expandedItems.map((dateGroup, index) => {
                    const isToday = dateGroup.date === today;

                    return (
                        <motion.div
                            key={dateGroup.date}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="overflow-hidden bg-white dark:bg-slate-800/90 shadow-sm dark:shadow-slate-900/30 sm:rounded-lg border border-gray-200 dark:border-slate-700"
                        >
                            <motion.div
                                className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/60 p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-900/80 transition-colors"
                                onClick={() => toggleCollapse(dateGroup.date)}
                            >
                                <div className="flex items-center gap-3">
                                    <motion.svg
                                        className="h-5 w-5 text-gray-500 dark:text-gray-400"
                                        animate={{ rotate: 90 }}
                                        transition={{ duration: 0.3 }}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </motion.svg>
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {dateGroup.day_name}, {dateGroup.formatted_date}
                                        {isToday && (
                                            <span className="ml-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                                                Today
                                            </span>
                                        )}
                                    </h3>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        ({dateGroup.tasks.length})
                                    </span>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddTask(dateGroup.date);
                                    }}
                                    className="flex items-center gap-1 rounded-md bg-gray-800 dark:bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    Add Task
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="overflow-hidden"
                            >
                                <div className="divide-y divide-gray-200 dark:divide-slate-700">
                                    {dateGroup.tasks.map((task, taskIndex) => (
                                        <motion.div
                                            key={task.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: taskIndex * 0.05 }}
                                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                            onClick={() => onTaskClick(task as CalendarTask)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(task.status)} shadow-sm`} />
                                                        <h4 className="font-medium text-gray-900 dark:text-gray-100">{task.title}</h4>
                                                        <span className="rounded-full bg-gray-100 dark:bg-slate-700/70 px-2 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-200">
                                                            {task.story_points ?? 0} pts
                                                        </span>
                                                    </div>
                                                    {task.project && (
                                                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{task.project}</p>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2 text-xs">
                                                        <span className={`font-medium ${getPriorityColor(task.priority)} px-2 py-1 rounded-md bg-gray-100 dark:bg-slate-700/60`}>
                                                            {task.priority.toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })}
            </AnimatePresence>

            {tasksByDate.length === 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-900/30 sm:rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No tasks yet. Click the + button on any date to create your first task.
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}
