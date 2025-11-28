import { router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { DateRangePicker, RangeKeyDict, Range } from 'react-date-range';
import { formatLocalDate } from '@/utils/date';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import './DateRangePicker.css';

interface CreatePeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CreatePeriodModal({ isOpen, onClose }: CreatePeriodModalProps) {
    const [name, setName] = useState('');
    const [dateRange, setDateRange] = useState<Range[]>([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection',
        },
    ]);

    const handleSelectDateRange = (ranges: RangeKeyDict) => {
        setDateRange([ranges.selection]);
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/periods', {
            start_date: formatLocalDate(dateRange[0].startDate),
            end_date: formatLocalDate(dateRange[0].endDate),
            name: name,
        }, {
            onSuccess: () => {
                onClose();
                setName('');
                setDateRange([
                    {
                        startDate: new Date(),
                        endDate: new Date(),
                        key: 'selection',
                    }
                ]);
            }
        });
    };

    const formatDateRange = () => {
        if (!dateRange[0].startDate || !dateRange[0].endDate) return 'Select dates';

        const start = dateRange[0].startDate;
        const end = dateRange[0].endDate;

        const formatDate = (date: Date | undefined) => {
            if (!date) return '';
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        };

        return `${formatDate(start)} - ${formatDate(end)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black bg-opacity-50"
                    />

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-6xl my-8 overflow-visible bg-white shadow-2xl rounded-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        Create New Period
                                    </h2>

                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                                    >
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Period Name <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-gray-800 focus:ring-gray-800 transition-all px-4 py-3"
                                            placeholder="e.g., Q4 Sprint"
                                        />
                                    </motion.div>

                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Select Period <span className="text-red-500">*</span>
                                        </label>

                                        <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium text-gray-500">Selected:</span>{' '}
                                                <span className="font-semibold text-gray-900">{formatDateRange()}</span>
                                            </p>
                                        </div>

                                        <div className="w-full flex justify-center">
                                            <div className="w-full max-w-5xl">
                                                <DateRangePicker
                                                    ranges={dateRange}
                                                    onChange={handleSelectDateRange}
                                                    moveRangeOnFirstSelection={false}
                                                    months={2}
                                                    direction="horizontal"
                                                    staticRanges={[]}
                                                    inputRanges={[]}
                                                    rangeColors={['#1f2937']}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <motion.div
                                        className="flex gap-3 pt-6 border-t border-gray-200"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <button
                                            type="submit"
                                            className="flex-1 rounded-xl bg-gray-800 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-700 transition-colors shadow-sm"
                                        >
                                            Create Period
                                        </button>
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 rounded-xl bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </motion.div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
