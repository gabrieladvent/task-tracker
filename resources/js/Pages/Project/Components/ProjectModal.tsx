import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ProjectForm from '@/Pages/Project/Components/ProjectForm';
import ProjectDetail from '@/Pages/Project/Components/ProjectDetail';
import { Project } from '@/Pages/Project/types/Project'

interface Props {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    mode: 'create' | 'edit' | 'view';
}

export default function ProjectModal({ isOpen, onClose, project, mode }: Props) {
    const getTitle = () => {
        switch (mode) {
            case 'create':
                return 'Create New Project';
            case 'edit':
                return 'Edit Project';
            case 'view':
                return 'Project Details';
            default:
                return '';
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {getTitle()}
                                </h2>
                                <motion.button
                                    whileHover={{ scale: 1.1, rotate: 90 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <X size={24} />
                                </motion.button>
                            </div>

                            <div className="p-6">
                                {mode === 'view' ? (
                                    <ProjectDetail project={project!} onClose={onClose} />
                                ) : (
                                    <ProjectForm
                                        project={project}
                                        mode={mode}
                                        onClose={onClose}
                                    />
                                )}
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
