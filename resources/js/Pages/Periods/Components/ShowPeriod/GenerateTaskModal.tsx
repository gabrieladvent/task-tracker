import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { router } from '@inertiajs/react';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    periodId: number | string;
}

export default function GenerateTaskModal({ isOpen, onClose, periodId }: Props) {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGenerate = () => {
        setLoading(true);
        router.post(
            route('periods.generate-tasks', periodId),
            { from_date: fromDate || null, to_date: toDate || null },
            {
                onSuccess: () => {
                    toast.success('Tasks successfully copied!', {
                        icon: '✨',
                        style: {
                            borderRadius: '12px',
                            background: '#10b981',
                            color: '#fff',
                        },
                    });
                    handleClose();
                },
                onError: (errors) => {
                    toast.error(errors?.message || 'Something went wrong. Please try again.');
                },
                onFinish: () => setLoading(false),
            }
        );
    };

    const handleClose = () => {
        setFromDate('');
        setToDate('');
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 24 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-6 pointer-events-none"
                    >
                        <div className="pointer-events-auto w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-800 shadow-2xl overflow-hidden">

                            {/* Header */}
                            <div className="px-7 pt-7 pb-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-100 dark:bg-slate-700">
                                            <svg className="h-6 w-6 text-gray-700 dark:text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                Generate Tasks
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                                                Copy incomplete tasks to another date
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleClose}
                                        className="shrink-0 rounded-xl p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-gray-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700" />

                            {/* Body */}
                            <div className="px-7 py-6 space-y-5">

                                {/* Info */}
                                <div className="flex items-start gap-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 border border-gray-100 dark:border-slate-600/50 px-4 py-3.5">
                                    <svg className="h-4 w-4 mt-0.5 shrink-0 text-gray-400 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                                        Both fields are optional. Defaults to copying from <span className="font-medium text-gray-700 dark:text-slate-300">yesterday</span> to <span className="font-medium text-gray-700 dark:text-slate-300">today</span>.
                                    </p>
                                </div>

                                {/* Date fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
                                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4" />
                                            </svg>
                                            Copy from
                                        </label>
                                        <input
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 px-3.5 py-2.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-400 focus:border-transparent transition-all"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-slate-500">default: yesterday</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-slate-300">
                                            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8V20m0 0l4-4m-4 4l-4-4" />
                                            </svg>
                                            Generate to
                                        </label>
                                        <input
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/60 px-3.5 py-2.5 text-sm text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-slate-400 focus:border-transparent transition-all"
                                        />
                                        <p className="text-xs text-gray-400 dark:text-slate-500">default: today</p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-gray-100 dark:bg-slate-700" />

                            {/* Footer */}
                            <div className="flex items-center justify-end gap-3 px-7 py-5">
                                <button
                                    onClick={handleClose}
                                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={loading}
                                    className="flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-slate-100 px-5 py-2.5 text-sm font-medium text-white dark:text-slate-900 hover:bg-gray-700 dark:hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                            Generate Tasks
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
