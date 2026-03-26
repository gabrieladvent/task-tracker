import { motion } from 'framer-motion';
import { ReportTask } from '../types/report';
import ReportTableRow from './ReportTableRow';

interface ReportTableProps {
    projectName: string;
    tasks: ReportTask[];
    sectionIndex: number;
    getStatusColor: (status: string) => string;
    getPriorityColor: (priority: string) => string;
}

export default function ReportTable({
    projectName,
    tasks,
    sectionIndex,
    getStatusColor,
    getPriorityColor
}: ReportTableProps) {
    const totalStoryPoints = tasks.reduce((sum, t) => sum + (t.story_point || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (sectionIndex + 1) }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden"
        >
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {projectName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {tasks.length} task(s) | Total SP: {totalStoryPoints}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">No</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Start Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">End Date</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Story Point</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">On Time</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {tasks.map((task, index) => (
                            <ReportTableRow
                                key={index}
                                task={task}
                                index={index}
                                getStatusColor={getStatusColor}
                                getPriorityColor={getPriorityColor}
                            />
                        ))}
                        {/* Total Row */}
                        <tr className="bg-gray-50 dark:bg-gray-700 font-semibold">
                            <td colSpan={7} className="px-4 py-3 text-sm text-right text-gray-900 dark:text-white">Total</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900 dark:text-white">
                                {totalStoryPoints}
                            </td>
                            <td className="px-4 py-3"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </motion.div>
    );
}
