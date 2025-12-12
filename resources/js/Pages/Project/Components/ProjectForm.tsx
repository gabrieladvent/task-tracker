import { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';
import ColorPicker from '@/Pages/Project/Components/ColorPicker';
import { Project } from '@/Pages/Project/types/Project';

interface Props {
    project: Project | null;
    mode: 'create' | 'edit';
    onClose: () => void;
}

const colors = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#f59e0b', '#84cc16', '#10b981',
    '#14b8a6', '#06b6d4', '#3b82f6', '#6d28d9'
];

export default function ProjectForm({ project, mode, onClose }: Props) {
    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: project?.name || '',
        description: project?.description || '',
        color: project?.color || colors[0],
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (mode === 'create') {
            post(route('projects.store'), {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            put(route('projects.update', project?.id), {
                onSuccess: () => {
                    onClose();
                },
            });
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Project Name <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                    type="text"
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter project name"
                    required
                />
                {errors.name && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                        {errors.name}
                    </motion.p>
                )}
            </div>

            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                </label>
                <textarea
                    id="description"
                    value={data.description || ''}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="Enter project description"
                />
                {errors.description && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                        {errors.description}
                    </motion.p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Project Color
                </label>
                <ColorPicker
                    colors={colors}
                    selectedColor={data.color}
                    onColorSelect={(color) => setData('color', color)}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    disabled={processing}
                >
                    Cancel
                </motion.button>
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {processing ? (
                        <>
                            <Loader2 size={20} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            {mode === 'create' ? 'Create Project' : 'Save Changes'}
                        </>
                    )}
                </motion.button>
            </div>
        </div>
    );
}
