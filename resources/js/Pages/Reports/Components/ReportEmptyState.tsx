import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface ReportEmptyStateProps {
    hasSearch: boolean;
    periodId?: string;
}

export default function ReportEmptyState({ hasSearch, periodId }: ReportEmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-lg shadow-sm p-12 text-center"
        >
            <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
            </svg>
            <p className="mt-4 text-gray-500">
                {hasSearch
                    ? 'No reports found matching your search.'
                    : periodId
                        ? 'No reports generated yet. Go to period view to generate your first report.'
                        : 'No reports available yet.'}
            </p>
            {!hasSearch && periodId && (
                <Link
                    href={`/periods/${periodId}`}
                    className="mt-4 inline-block text-blue-600 hover:text-blue-800"
                >
                    Go to Period →
                </Link>
            )}
        </motion.div>
    );
}
