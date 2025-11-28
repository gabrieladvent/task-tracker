import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Period } from '@/Pages/Periods/types/period';

interface PeriodCardProps {
    period: Period;
    index: number;
}

export default function PeriodCard({ period, index }: PeriodCardProps) {
    const completionPercentage = period.tasks_count > 0
        ? (period.completed_tasks_count / period.tasks_count) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <Link
                href={`/periods/${period.id}`}
                className="block overflow-hidden bg-white shadow-sm transition hover:shadow-md sm:rounded-lg"
            >
                <motion.div
                    className="p-6"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {period.name}
                        </h3>

                        {period.is_current && (
                            <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800"
                            >
                                Current Period
                            </motion.span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-gray-600">
                        {period.start_date} - {period.end_date}
                    </p>

                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-2xl font-bold text-gray-900">
                                {period.completed_tasks_count}
                                <span className="text-base font-normal text-gray-600">
                                    {' '}/ {period.tasks_count}
                                </span>
                            </p>
                            
                            <p className="text-xs text-gray-500">
                                Tasks Completed
                            </p>
                        </div>
                        <div className="h-16 w-16">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-gray-200"
                                    strokeWidth="3"
                                />
                                <motion.circle
                                    cx="18"
                                    cy="18"
                                    r="16"
                                    fill="none"
                                    className="stroke-current text-green-500"
                                    strokeWidth="3"
                                    strokeDasharray="100, 100"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0, 100" }}
                                    animate={{ strokeDasharray: `${completionPercentage}, 100` }}
                                    transition={{ duration: 1, ease: "easeOut", delay: index * 0.1 + 0.3 }}
                                />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            </Link>
        </motion.div>
    );
}
