import { motion } from 'framer-motion';

interface StatsBarProps {
    totalTasks: number;
    doneTasks: number;
}

export default function StatsBar({ totalTasks, doneTasks }: StatsBarProps) {
    const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 bg-white dark:bg-slate-800/80 rounded-xl px-5 py-3 shadow-sm border border-gray-100 dark:border-slate-700"
        >
            <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                        className="h-full rounded-full bg-emerald-500"
                    />
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums min-w-[3rem]">
                    {progress}%
                </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-400 divide-x divide-gray-200 dark:divide-slate-600">
                <span className="pr-3 font-medium">{totalTasks} tasks</span>
                <span className="pl-3 text-emerald-600 dark:text-emerald-400 font-semibold">{doneTasks} done</span>
            </div>
        </motion.div>
    );
}
