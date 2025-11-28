import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import { NewTaskData, Project } from '@/Pages/Periods/types/period';
import { useEffect, useState } from 'react';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: string;
    newTask: NewTaskData;
    onNewTaskChange: (updates: Partial<NewTaskData>) => void;
    periodId: string;
}

export default function TaskModal({
    isOpen,
    onClose,
    selectedDate,
    newTask,
    onNewTaskChange,
    periodId
}: TaskModalProps) {

    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        if (isOpen) {
            fetchProjects();
        }
    }, [isOpen]);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error('Failed to fetch projects:', error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/periods/${periodId}/tasks`, {
            ...newTask,
            task_date: selectedDate,
            story_points: newTask.story_points ? parseInt(newTask.story_points) : null,
        }, {
            onSuccess: () => {
                onClose();
            }
        });
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
                                    <h3 className="text-lg font-semibold text-gray-900">New Task</h3>
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

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700">Title *</label>
                                        <input
                                            type="text"
                                            value={newTask.title}
                                            onChange={(e) => onNewTaskChange({ title: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                            required
                                            autoFocus
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={newTask.description}
                                            onChange={(e) => onNewTaskChange({ description: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                            rows={3}
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Status</label>
                                            <select
                                                value={newTask.status}
                                                onChange={(e) => onNewTaskChange({ status: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                            >
                                                <option value="todo">Todo</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="on_hold">On Hold</option>
                                                <option value="code_review">Code Review</option>
                                                <option value="done">Done</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Priority</label>
                                            <select
                                                value={newTask.priority}
                                                onChange={(e) => onNewTaskChange({ priority: e.target.value })}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                            </select>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700">Story Points</label>
                                        <input
                                            type="number"
                                            value={newTask.story_points}
                                            onChange={(e) => onNewTaskChange({ story_points: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                            min="0"
                                            max="100"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.18 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700">Project</label>
                                        <select
                                            value={newTask.project_id || ''}
                                            onChange={(e) => onNewTaskChange({ project_id: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-colors"
                                        >
                                            <option value="">Select Project</option>
                                            {projects.map(project => (
                                                <option key={project.id} value={project.id}>
                                                    {project.name}
                                                </option>
                                            ))}
                                        </select>
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="flex gap-2 pt-4"
                                    >
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="submit"
                                            className="flex-1 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                                        >
                                            Create Task
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </motion.button>
                                    </motion.div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
