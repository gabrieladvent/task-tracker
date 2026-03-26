import { motion } from 'framer-motion';
import { PastPeriod } from '../types/dashboard';

interface Props {
    pastPeriods: PastPeriod[];
    fadeUp: (delay?: number) => object;
}

export function CompletionTrend({ pastPeriods, fadeUp }: Props) {
    return (
        <motion.div
            {...fadeUp(0.15)}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6"
        >
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Completion Trend
            </h2>

            {pastPeriods.length === 0 ? (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
                    No past periods yet.
                </p>
            ) : (
                <div className="flex flex-col gap-3">
                    {pastPeriods.map((p, i) => (
                        <div key={i}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
                                    {p.name}
                                </span>
                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-2">
                                    {p.completion_pct}%
                                </span>
                            </div>
                            <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${p.completion_pct}%` }}
                                    transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                                    className={`h-full rounded-full ${p.completion_pct >= 80 ? 'bg-green-500' :
                                            p.completion_pct >= 50 ? 'bg-blue-500' :
                                                'bg-amber-400'
                                        }`}
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5">
                                {p.done}/{p.total} tasks
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
