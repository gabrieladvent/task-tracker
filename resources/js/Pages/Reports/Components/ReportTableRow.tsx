import { motion } from 'framer-motion';
import { ReportTask } from '../types/report';

interface ReportTableRowProps {
    task: ReportTask;
    index: number;
    getStatusColor: (status: string) => string;
    getPriorityColor: (priority: string) => string;
}

export default function ReportTableRow({
    task,
    index,
    getStatusColor,
    getPriorityColor
}: ReportTableRowProps) {
    return (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05 * index }}
            className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{index + 1}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()}
                </span>
            </td>
            <td className="px-4 py-3 text-sm text-gray-900 dark:text-white max-w-xs">
                <div className="font-medium">{task.title}</div>
            </td>
            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md">
                <div className="line-clamp-2">{task.description || '-'}</div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{task.start_date}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{task.end_date}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-gray-900 dark:text-white">{task.story_point}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                {task.delivery_tepat_waktu === 'Yes' ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 font-bold">✓</span>
                ) : task.delivery_tepat_waktu === 'No' ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold">✗</span>
                ) : (
                    <span className="text-gray-400 dark:text-gray-500">-</span>
                )}
            </td>
        </motion.tr>
    );
}
