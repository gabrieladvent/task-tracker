import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProjectCard from '@/Pages/Project/Components/ProjectCard';
import ProjectModal from '@/Pages/Project/Components/ProjectModal';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import SearchBar from '@/Components/SearchBar';
import PerPageSelector from '@/Components/PerPageSelector';
import Pagination from '@/Components/Pagination';
import { Project } from '@/Pages/Project/types/Project';

interface ProjectCardData {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    created_at: string;
}

interface Props {
    projects: {
        data: ProjectCardData[];
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
}

export default function Index({ projects, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<ProjectCardData | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

    const handleCreate = () => {
        setSelectedProject(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (project: ProjectCardData) => {
        setSelectedProject(project);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (project: ProjectCardData) => {
        setSelectedProject(project);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Projects" />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="mb-4">
                            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage and organize your projects
                            </p>
                        </div>

                        {/* Search & Per Page */}
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 max-w-md">
                                <SearchBar
                                    initialSearch={filters.search ?? ''}
                                    placeholder="Search projects..."
                                />
                            </div>

                            <div className="flex items-center gap-4">
                                <PerPageSelector currentPerPage={filters.per_page} />

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 dark:bg-gray-100 dark:text-gray-800 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-gray-700"
                                >
                                    <Plus size={20} />
                                    New Project
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Projects Grid */}
                    {projects.data.length > 0 ? (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
                                {projects.data.map((project, index) => (
                                    <ProjectCard
                                        key={project.id}
                                        project={project}
                                        index={index}
                                        onEdit={handleEdit}
                                        onView={handleView}
                                    />
                                ))}
                            </div>

                            {/* Pagination */}
                            <Pagination links={projects.links} />

                            {/* Info */}
                            <div className="text-center text-sm text-gray-600 mt-4">
                                Showing {projects.data.length} of {projects.total} projects
                            </div>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white rounded-lg shadow-sm p-12 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                                    />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {filters.search ? 'No projects found' : 'No projects yet'}
                            </h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {filters.search
                                    ? `No projects match "${filters.search}"`
                                    : 'Get started by creating your first project'
                                }
                            </p>
                            {!filters.search && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCreate}
                                    className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
                                >
                                    <Plus size={20} />
                                    Create Project
                                </motion.button>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>

            <ProjectModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                project={selectedProject}
                mode={modalMode}
            />
        </AuthenticatedLayout>
    );
}
