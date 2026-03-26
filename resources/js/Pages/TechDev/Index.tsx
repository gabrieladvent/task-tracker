import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TechDevTaskCard from '@/Pages/TechDev/Components/TechDevTaskCard';
import TechDevTaskModal from '@/Pages/TechDev/Components/TechDevTaskModal';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SearchBar from '@/Components/SearchBar';
import PerPageSelector from '@/Components/PerPageSelector';
import Pagination from '@/Components/Pagination';
import { TechDevTask } from '@/Pages/TechDev/types/TechDevTask';

interface Project {
    id: string;
    name: string;
    color: string | null;
}

interface Props {
    tasks: {
        data: TechDevTask[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search: string;
        per_page: number;
    };
    projects: Project[];
}

export default function Index({ tasks, filters, projects }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TechDevTask | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    const handleCreate = () => {
        setSelectedTask(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (task: TechDevTask) => {
        setSelectedTask(task);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (task: TechDevTask) => {
        setSelectedTask(task);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTask(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Tech Dev Tasks" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-200">Tech Dev Tasks</h2>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                Manage your technical development backlog
                            </p>
                        </div>

                        {/* Search & Per Page */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <SearchBar
                                    initialSearch={filters.search ?? ''}
                                    placeholder="Search tech dev tasks..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PerPageSelector currentPerPage={filters.per_page} />

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-gray-700 dark:hover:bg-gray-200"
                                >
                                    <Plus size={20} />
                                    New Task
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Tasks Grid */}
                    {tasks.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                                {tasks.data.map((task, index) => (
                                    <TechDevTaskCard
                                        key={task.id}
                                        task={task}
                                        index={index}
                                        onEdit={handleEdit}
                                        onView={handleView}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination links={tasks.links} />

                            {/* Info */}
                            <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                                Showing {tasks.data.length} of {tasks.total} tasks
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400 dark:text-gray-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                                {filters.search ? 'No tasks found' : 'No tech dev tasks yet'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                {filters.search
                                    ? `No tasks match "${filters.search}"`
                                    : 'Get started by creating your first tech dev task'
                                }
                            </p>
                            {!filters.search && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    className="inline-flex items-center gap-2 rounded-md dark:bg-gray-100 dark:text-gray-800 bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors"
                                >
                                    <Plus size={20} />
                                    Create Task
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <TechDevTaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                task={selectedTask}
                mode={modalMode}
                projects={projects}
            />
        </AuthenticatedLayout>
    );
}
