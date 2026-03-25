import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { PeriodStats } from '../types/dashboard';

interface Props {
    currentPeriod: PeriodStats | null;
    fadeUp: (delay?: number) => object;
}

export function CurrentPeriodCard({ currentPeriod, fadeUp }: Props) {
    if (!currentPeriod) {
        return (
            <motion.div
                {...fadeUp(0.05)}
                className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 p-8 text-center"
            >
                <p className="text-gray-400 dark:text-gray-500 mb-3">No active period right now.</p>
                <Link href={route('periods.index')} className="text-sm text-gray-700 dark:text-gray-300 underline">
                    Go to Periods
                </Link>
            </motion.div>
        );
    }

    return (
        <motion.div {...fadeUp(0.05)}>
            <Link
                href={route('periods.show', currentPeriod.id)}
                className="block rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:shadow-md transition-shadow"
            >
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2.5 py-1 rounded-full mb-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            Current Period
                        </span>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {currentPeriod.name}
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {currentPeriod.start_date} → {currentPeriod.end_date}
                        </p>
                    </div>
                    <span className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                        {currentPeriod.completion_pct}%
                    </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentPeriod.completion_pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="h-full bg-green-500 rounded-full"
                    />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {currentPeriod.done_tasks}
                            <span className="text-sm font-normal text-gray-400 ml-1">/ {currentPeriod.total_tasks}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Tasks done</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-amber-500">{currentPeriod.carry_over}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Carry-over</p>
                    </div>
                    <div>
                        <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            {currentPeriod.days_elapsed}
                            <span className="text-sm font-normal text-gray-400 ml-1">/ {currentPeriod.days_total}</span>
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Days elapsed</p>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}
