import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ProjectCard from '@/Pages/Project/Components/ProjectCard';
import ProjectModal from '@/Pages/Project/Components/ProjectModal';
import { motion } from 'framer-motion';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '@/Pages/Project/types/Project';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedProjects {
    data: Project[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Props {
    projects: PaginatedProjects;
    filters: {
        search: string;
    };
}

export default function Index({ projects, filters }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [search, setSearch] = useState(filters.search || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            router.get(
                route('projects.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                }
            );
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const handleCreate = () => {
        setSelectedProject(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleView = (project: Project) => {
        setSelectedProject(project);
        setModalMode('view');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    };

    const handlePageChange = (url: string | null) => {
        if (url) {
            router.get(url, {}, { preserveState: true });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Projects" />

            <div className="py-10 w-full">
                <div className="max-w-full mx-auto sm:px-6 lg:px-8">
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">Projects</h2>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage your projects and track progress
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Search Bar */}
                            <div className="">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search projects..."
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCreate}
                                className="inline-flex items-center rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:bg-gray-700 hover:scale-105 hover:shadow-lg"
                            >
                                <Plus size={20} />
                                New Project
                            </motion.button>
                        </div>
                    </div>



                    {projects.data.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-lg shadow-sm p-12 text-center"
                        >
                            <div className="text-gray-400 mb-4">
                                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {search ? 'No projects found' : 'No projects yet'}
                            </h3>
                            <p className="text-gray-500 mb-6">
                                {search
                                    ? `No projects match "${search}"`
                                    : 'Get started by creating your first project'
                                }
                            </p>
                            {!search && (
                                <button
                                    onClick={handleCreate}
                                    className="inline-flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                >
                                    <Plus size={20} />
                                    Create Project
                                </button>
                            )}
                        </motion.div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            {projects.last_page > 1 && (
                                <div className="mt-8 flex items-center justify-between">
                                    <div className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{projects.from}</span> to{' '}
                                        <span className="font-medium">{projects.to}</span> of{' '}
                                        <span className="font-medium">{projects.total}</span> results
                                    </div>

                                    <div className="flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handlePageChange(projects.links[0]?.url)}
                                            disabled={projects.current_page === 1}
                                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ChevronLeft size={16} />
                                            Previous
                                        </motion.button>

                                        <div className="flex gap-2">
                                            {projects.links.slice(1, -1).map((link, index) => (
                                                <motion.button
                                                    key={index}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handlePageChange(link.url)}
                                                    className={`px-4 py-2 rounded-lg transition-colors ${link.active
                                                        ? 'bg-gray-600 text-white'
                                                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {link.label}
                                                </motion.button>
                                            ))}
                                        </div>

                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handlePageChange(projects.links[projects.links.length - 1]?.url)}
                                            disabled={projects.current_page === projects.last_page}
                                            className="flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                            <ChevronRight size={16} />
                                        </motion.button>
                                    </div>
                                </div>
                            )}
                        </>
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
