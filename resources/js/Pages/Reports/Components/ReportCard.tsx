import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';

interface ReportCardProps {
    report: {
        id: string;
        report_name: string;
        total_tasks: number;
        completed_tasks: number;
        total_story_points: number;
        created_at: string;
        period?: {
            id: string;
            name: string;
            start_date: string;
            end_date: string;
        };
    };
    periodId: string;
    index: number;
    showPeriodBadge?: boolean;
}

export default function ReportCard({ report, periodId, index, showPeriodBadge = false }: ReportCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Link
                href={`/periods/${periodId}/reports/${report.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
                {showPeriodBadge && report.period && (
                    <div className="mb-3">
                        <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {report.period.name}
                        </span>
                    </div>
                )}

                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                    {report.report_name}
                </h3>

                {showPeriodBadge && report.period && (
                    <p className="text-xs text-gray-500 mb-3">
                        {report.period.start_date} - {report.period.end_date}
                    </p>
                )}

                <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-medium">{report.total_tasks}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium text-green-600">
                            {report.completed_tasks}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span>Story Points:</span>
                        <span className="font-medium">{report.total_story_points}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-3 pt-3 border-t">
                        Created: {report.created_at}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
