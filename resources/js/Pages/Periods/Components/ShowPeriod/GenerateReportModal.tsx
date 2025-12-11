import { useState } from 'react';
import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';

interface GenerateReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    periodId: string;
    periodName: string;
}

export default function GenerateReportModal({ isOpen, onClose, periodId, periodName }: GenerateReportModalProps) {
    const [reportName, setReportName] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateReport = () => {
        if (isGenerating) return;

        setIsGenerating(true);

        const reportData = {
            report_name: reportName || `Report ${periodName}`,
        };

        router.post(`/periods/${periodId}/reports`, reportData, {
            preserveScroll: true,
            onSuccess: () => {
                setIsGenerating(false);
                onClose();
                setReportName('');
            },
            onError: () => {
                setIsGenerating(false);
            },
        });
    };

    const handleClose = () => {
        if (!isGenerating) {
            onClose();
            setReportName('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Generate Report
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Create a detailed report for this period. The report will include all tasks and their status.
                            </p>
                        </div>

                        <div className="mb-6">
                            <label htmlFor="reportName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Report Name
                            </label>
                            <input
                                id="reportName"
                                type="text"
                                value={reportName}
                                onChange={(e) => setReportName(e.target.value)}
                                placeholder="e.g., Weekly Report, Sprint Review"
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-blue-500 focus:border-transparent transition"
                                disabled={isGenerating}
                            />
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                Optional. If empty, a default name will be used.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isGenerating}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${isGenerating
                                        ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                                        : 'bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-700 dark:hover:bg-blue-700'
                                    }`}
                            >
                                {isGenerating ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Generating...</span>
                                    </div>
                                ) : (
                                    'Generate Report'
                                )}
                            </button>
                            <button
                                onClick={handleClose}
                                disabled={isGenerating}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${isGenerating
                                        ? 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed text-gray-400 dark:text-gray-500'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                Cancel
                            </button>
                        </div>

                        {isGenerating && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Please wait while the report is being generated...
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
