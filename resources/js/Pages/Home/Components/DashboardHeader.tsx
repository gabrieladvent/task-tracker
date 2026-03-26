import { motion } from 'framer-motion';

interface Props {
    dayName: string;
    dateLabel: string;
    fadeUp: (delay?: number) => object;
}

export function DashboardHeader({ dayName, dateLabel, fadeUp }: Props) {
    return (
        <motion.div {...fadeUp(0)} className="mb-8">
            <p className="text-sm text-gray-400 dark:text-gray-500 uppercase tracking-widest font-medium">
                {dayName}
            </p>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
                {dateLabel}
            </h1>
        </motion.div>
    );
}
