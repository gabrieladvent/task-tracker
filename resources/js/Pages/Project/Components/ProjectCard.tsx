import { Project } from '@/Pages/Project/types/Project';
import { motion } from 'framer-motion';
import { Edit2, Eye, Folder } from 'lucide-react';

interface Props {
    project: Project;
    index: number;
    onEdit: (project: Project) => void;
    onView: (project: Project) => void;
}

export default function ProjectCard({ project, index, onEdit, onView }: Props) {
    const defaultColor = '#6366f1';
    const projectColor = project.color || defaultColor;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-700 rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden cursor-pointer"
            onClick={() => onView(project)}
        >
            <div
                className="h-2"
                style={{ backgroundColor: projectColor }}
            />

            <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${projectColor}20` }}
                        >
                            <Folder size={24} style={{ color: projectColor }} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-200">
                                {project.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                Created {project.created_at}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-gray-600 dark:text-gray-200 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    {project.description || 'No description provided'}
                </p>

                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(project);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                        <Eye size={16} />
                        View
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit(project);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-3 py-2 rounded-md hover:bg-indigo-100 transition-colors text-sm"
                    >
                        <Edit2 size={16} />
                        Edit
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
