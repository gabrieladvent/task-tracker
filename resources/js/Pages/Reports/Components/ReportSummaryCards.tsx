import { motion } from 'framer-motion';

interface ReportSummaryCardsProps {
    totalTasks: number;
    completedTasks: number;
    totalStoryPoints: number;
}

export default function ReportSummaryCards({
    totalTasks,
    completedTasks,
    totalStoryPoints
}: ReportSummaryCardsProps) {
    const cards = [
        { label: 'Total Tasks', value: totalTasks, color: 'text-gray-900 dark:text-white', delay: 0.1 },
        { label: 'Completed Tasks', value: completedTasks, color: 'text-green-600 dark:text-green-400', delay: 0.2 },
        { label: 'Total Story Points', value: totalStoryPoints, color: 'text-blue-600 dark:text-blue-400', delay: 0.3 },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {cards.map((card) => (
                <motion.div
                    key={card.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: card.delay }}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4"
                >
                    <div className="text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
                    <div className={`text-2xl font-bold ${card.color}`}>
                        {card.value}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
