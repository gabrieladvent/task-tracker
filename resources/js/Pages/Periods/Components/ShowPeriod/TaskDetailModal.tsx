import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { CalendarTask } from '@/Pages/Periods/types/period';
import { getStatusColor, getStatusBadgeColor, getStatusLabel, getPriorityColor } from '@/Pages/Periods/utils';

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: CalendarTask | null;
    periodId: string;
}

export default function TaskDetailModal({ isOpen, onClose, task, periodId }: TaskDetailModalProps) {
    if (!task) return null;

    const handleUpdateTask = (updates: Partial<CalendarTask>) => {
        router.put(`/tasks/${task.id}`, updates, {
            onSuccess: () => {
                onClose();
            }
        });
    };

    const handleDeleteTask = () => {
        if (confirm('Are you sure you want to delete this task?')) {
            router.delete(`/tasks/${task.id}`, {
                onSuccess: () => {
                    onClose();
                }
            });
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClick={onClose}
                >
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                        />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", damping: 25 }}
                            className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Task Details</h3>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </motion.button>
                                </div>

                                <div className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
                                            <span className={`text-sm font-medium px-2 py-1 rounded ${getStatusBadgeColor(task.status)}`}>
                                                {getStatusLabel(task.status)}
                                            </span>
                                        </div>
                                        <h4 className="text-xl font-semibold text-gray-900">{task.title}</h4>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Priority</label>
                                            <p className={`mt-1 font-medium ${getPriorityColor(task.priority)}`}>
                                                {task.priority.toUpperCase()}
                                            </p>
                                        </div>
                                        {task.story_points && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-500 uppercase">Story Points</label>
                                                <p className="mt-1 font-medium text-gray-900">{task.story_points}</p>
                                            </div>
                                        )}
                                    </motion.div>

                                    {task.project && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <label className="block text-xs font-medium text-gray-500 uppercase">Project</label>
                                            <p className="mt-1 text-gray-900">{task.project}</p>
                                        </motion.div>
                                    )}

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="border-t pt-4 mt-4"
                                    >
                                        <div className="flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUpdateTask({
                                                    status: task.status === 'done' ? 'todo' : 'done'
                                                })}
                                                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                                            >
                                                {task.status === 'done' ? 'Mark as Todo' : 'Mark as Done'}
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleDeleteTask}
                                                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                                            >
                                                Delete
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
