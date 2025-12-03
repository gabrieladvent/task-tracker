import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { motion } from 'framer-motion';
import { ReportShowData } from './types/report';
import { useState } from 'react';
import ConfirmDeleteModal from '@/Components/ConfirmDeleteModal';
import ReportSummaryCards from './Components/ReportSummaryCards';
import ReportTable from './Components/ReportTable';
import ReportEmptyState from './Components/ReportEmptyState';

interface Props {
    period: {
        id: string;
        name: string;
        start_date: string;
        end_date: string;
    };
    report: ReportShowData;
}

export default function ReportsShow({ period, report }: Props) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleExport = () => {
        window.location.href = `/periods/${period.id}/reports/${report.id}/export`;
    };

    const handleDelete = () => {
        router.delete(`/periods/${period.id}/reports/${report.id}`, {
            onSuccess: () => {
                router.visit(`/periods/${period.id}/reports`);
            },
        });
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            done: 'bg-green-100 text-green-800',
            in_progress: 'bg-blue-100 text-blue-800',
            todo: 'bg-gray-100 text-gray-800',
            on_hold: 'bg-yellow-100 text-yellow-800',
            cancelled: 'bg-red-100 text-red-800',
            code_review: 'bg-purple-100 text-purple-800',
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            high: 'bg-red-100 text-red-800',
            medium: 'bg-yellow-100 text-yellow-800',
            low: 'bg-gray-100 text-gray-800',
        };
        return colors[priority] || 'bg-gray-100 text-gray-800';
    };

    return (
        <AuthenticatedLayout>
            <Head title={report.report_name} />

            <div className="py-10 w-full">
                <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {report.report_name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    Period: {period.name} ({period.start_date} - {period.end_date})
                                </p>
                                <p className="text-xs text-gray-500">
                                    Generated: {report.created_at}
                                </p>
                            </div>
                            <Link
                                href={`/periods/${period.id}/reports`}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                ← Back to Reports
                            </Link>
                        </div>

                        <ReportSummaryCards
                            totalTasks={report.total_tasks}
                            completedTasks={report.completed_tasks}
                            totalStoryPoints={report.total_story_points}
                        />

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Export to Excel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete Report
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Report Data Tables */}
                    <div className="space-y-6">
                        {Object.entries(report.report_data).map(([projectName, tasks], sectionIndex) => (
                            <ReportTable
                                key={projectName}
                                projectName={projectName}
                                tasks={tasks}
                                sectionIndex={sectionIndex}
                                getStatusColor={getStatusColor}
                                getPriorityColor={getPriorityColor}
                            />
                        ))}
                    </div>

                    {/* Empty State */}
                    {Object.keys(report.report_data).length === 0 && (
                        <ReportEmptyState hasSearch={false} />
                    )}
                </div>
            </div>

            <ConfirmDeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Report"
                message="Are you sure you want to delete this report? This action cannot be undone."
            />
        </AuthenticatedLayout>
    );
}
