import { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Trash2, Edit2, Folder, Calendar, Loader2 } from 'lucide-react';
import DeleteConfirmation from '@/Pages/Project/Components/DeleteConfirmation';
import { Project } from '@/Pages/Project/types/Project';

interface Props {
    project: Project;
    onClose: () => void;
}

export default function ProjectDetail({ project, onClose }: Props) {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEdit = () => {
        onClose();
        setTimeout(() => {
            router.reload({ only: ['projects'] });
        }, 100);
    };

    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('projects.destroy', project.id), {
            onSuccess: () => {
                onClose();
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const defaultColor = '#6366f1';
    const projectColor = project.color || defaultColor;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${projectColor}20` }}
                >
                    <Folder size={32} style={{ color: projectColor }} />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar size={14} />
                        <span>Created recently</span>
                    </div>
                </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {project.description || 'No description provided for this project.'}
                </p>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Project Color</h4>
                <div className="flex items-center gap-3">
                    <div
                        className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600"
                        style={{ backgroundColor: projectColor }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-mono">{projectColor}</span>
                </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                    Close
                </motion.button>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="flex items-center justify-center gap-2 bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isDeleting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Trash2 size={18} />
                    )}
                </motion.button>
            </div>

            <DeleteConfirmation
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={handleDelete}
                projectName={project.name}
            />
        </div>
    );
}
