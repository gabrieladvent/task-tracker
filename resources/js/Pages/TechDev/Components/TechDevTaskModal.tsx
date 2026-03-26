import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, ArrowRight, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { TechDevTask } from '../types/TechDevTask';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';

interface Project {
    id: string;
    name: string;
    color: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    task: TechDevTask | null;
    mode: 'create' | 'edit' | 'view';
    projects: Project[];
}

export default function TechDevTaskModal({ isOpen, onClose, task, mode, projects }: Props) {
    const [showMoveToTask, setShowMoveToTask] = useState(false);
    const [currentMode, setCurrentMode] = useState<'create' | 'edit' | 'view'>(mode);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        project_id: task?.project_id || '',
        title: task?.title || '',
        description: task?.description || '',
        notes: task?.notes || '',
    });

    const moveForm = useForm({
        task_date: new Date().toISOString().split('T')[0],
        status: 'todo',
        priority: 'medium',
        story_points: '',
    });

    useEffect(() => {
        if (task) {
            setData({
                project_id: task.project_id || '',
                title: task.title || '',
                description: task.description || '',
                notes: task.notes || '',
            });
        } else {
            reset();
        }
        setCurrentMode(mode);
        setShowMoveToTask(false);
    }, [task, mode, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (currentMode === 'create') {
            post(route('tech-dev.store'), {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else if (currentMode === 'edit' && task) {
            put(route('tech-dev.update', task.id), {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const handleDelete = () => {
        if (task) {
            router.delete(route('tech-dev.destroy', task.id), {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    const handleMoveToTask = (e: React.FormEvent) => {
        e.preventDefault();

        if (task) {
            router.post(route('tech-dev.move-to-task', task.id), moveForm.data, {
                onSuccess: () => {
                    onClose();
                    setShowMoveToTask(false);
                },
                onError: () => {
                    console.log('eerorr');

                    setShowMoveToTask(false);
                }
            });
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/50 z-40"
                        />

                        {/* Modal */}
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                        {currentMode === 'create' && 'Create Tech Dev Task'}
                                        {currentMode === 'edit' && 'Edit Tech Dev Task'}
                                        {currentMode === 'view' && 'Tech Dev Task Details'}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                                    {!showMoveToTask ? (
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            {/* Project */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    <Folder size={16} className="inline mr-1" />
                                                    Project (Optional)
                                                </label>
                                                <select
                                                    value={data.project_id}
                                                    onChange={(e) => setData('project_id', e.target.value)}
                                                    disabled={currentMode === 'view'}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                                >
                                                    <option value="">No Project</option>
                                                    {projects.map((project) => (
                                                        <option key={project.id} value={project.id}>
                                                            {project.name}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.project_id && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.project_id}</p>
                                                )}
                                            </div>

                                            {/* Title */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Title *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={data.title}
                                                    onChange={(e) => setData('title', e.target.value)}
                                                    disabled={currentMode === 'view'}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                                    placeholder="Enter task title..."
                                                />
                                                {errors.title && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
                                                )}
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={data.description}
                                                    onChange={(e) => setData('description', e.target.value)}
                                                    disabled={currentMode === 'view'}
                                                    rows={4}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                                    placeholder="Enter task description..."
                                                />
                                                {errors.description && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                                                )}
                                            </div>

                                            {/* Notes */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Notes
                                                </label>
                                                <textarea
                                                    value={data.notes}
                                                    onChange={(e) => setData('notes', e.target.value)}
                                                    disabled={currentMode === 'view'}
                                                    rows={3}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-600"
                                                    placeholder="Additional notes..."
                                                />
                                                {errors.notes && (
                                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>
                                                )}
                                            </div>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleMoveToTask} className="space-y-4">
                                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                                    Move this tech dev task to today's active period as a regular task.
                                                </p>
                                            </div>

                                            {/* Task Date */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    <Calendar size={16} className="inline mr-1" />
                                                    Task Date *
                                                </label>
                                                <input
                                                    type="date"
                                                    value={moveForm.data.task_date}
                                                    onChange={(e) => moveForm.setData('task_date', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                />
                                            </div>

                                            {/* Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={moveForm.data.status}
                                                    onChange={(e) => moveForm.setData('status', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                >
                                                    <option value="todo">To Do</option>
                                                    <option value="in_progress">In Progress</option>
                                                    <option value="on_hold">On Hold</option>
                                                    <option value="code_review">Code Review</option>
                                                    <option value="done">Done</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                            </div>

                                            {/* Priority */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Priority
                                                </label>
                                                <select
                                                    value={moveForm.data.priority}
                                                    onChange={(e) => moveForm.setData('priority', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                </select>
                                            </div>

                                            {/* Story Points */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Story Points
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={moveForm.data.story_points}
                                                    onChange={(e) => moveForm.setData('story_points', e.target.value)}
                                                    className="w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 shadow-sm focus:border-gray-500 focus:ring-gray-500"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </form>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                                    {!showMoveToTask ? (
                                        <>
                                            <div>
                                                {currentMode === 'view' && task && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowMoveToTask(true)}
                                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                                                    >
                                                        <ArrowRight size={16} />
                                                        Move to Task
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-3">
                                                {currentMode === 'view' && task && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowDeleteModal(true)}
                                                            className="px-4 py-2 text-sm font-medium text-red-700 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 transition-colors"
                                                        >
                                                            Delete
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setCurrentMode('edit')}
                                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                    </>
                                                )}

                                                {(currentMode === 'create' || currentMode === 'edit') && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={onClose}
                                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            onClick={handleSubmit}
                                                            disabled={processing}
                                                            className="px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-100 dark:text-gray-800 rounded-md hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50"
                                                        >
                                                            {processing ? 'Saving...' : currentMode === 'create' ? 'Create' : 'Save'}
                                                        </button>
                                                    </>
                                                )}

                                                {currentMode === 'view' && (
                                                    <button
                                                        type="button"
                                                        onClick={onClose}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-gray-800 dark:bg-gray-100 dark:text-gray-800 rounded-md hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                                                    >
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => setShowMoveToTask(false)}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                            >
                                                ← Back
                                            </button>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowMoveToTask(false)}
                                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    onClick={handleMoveToTask}
                                                    disabled={moveForm.processing}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    {moveForm.processing ? 'Moving...' : 'Move to Task'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {/* Confirm Delete Modal */}
            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Tech Dev Task"
                message="Are you sure you want to delete this tech dev task? This action cannot be undone."
            />
        </>
    );
}
