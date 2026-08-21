import { router } from '@inertiajs/react';
import { format, isSameDay } from 'date-fns';
import { AnimatePresence, motion, MotionConfig, Variants } from 'framer-motion';
import { X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import BaseModal from '@/Components/BaseModal';
import DateRangeCalendar, { DateRange } from '@/Components/DateRangeCalendar';
import { formatLocalDate } from '@/utils/date';

interface CreatePeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const emptyRange: DateRange = { start: null, end: null };

/** The form sections cascade in once the panel has finished opening. */
const formVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 320, damping: 30 },
    },
};

const errorVariants: Variants = {
    hidden: { opacity: 0, height: 0, marginTop: 0 },
    visible: { opacity: 1, height: 'auto', marginTop: 8 },
};

export default function CreatePeriodModal({
    isOpen,
    onClose,
}: CreatePeriodModalProps) {
    const [name, setName] = useState('');
    const [range, setRange] = useState<DateRange>(emptyRange);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const reset = () => {
        setName('');
        setRange(emptyRange);
        setErrors({});
    };

    const handleClose = () => {
        if (processing) return;
        reset();
        onClose();
    };

    const validate = () => {
        const next: Record<string, string> = {};
        if (!name.trim()) next.name = 'Period name is required.';
        // A half-picked range has a start but no end yet.
        if (!range.start || !range.end) {
            next.range = 'Pick a start and end date.';
        } else if (isSameDay(range.start, range.end)) {
            // PeriodeRequest validates `end_date` with `after:start_date`, so a
            // single-day period is rejected server side. Say so before posting.
            next.range = 'A period must span at least two days.';
        }
        return next;
    };

    const handleCreate = (e: FormEvent) => {
        e.preventDefault();
        const nextErrors = validate();
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        setProcessing(true);
        router.post(
            '/periods',
            {
                start_date: formatLocalDate(range.start ?? undefined),
                end_date: formatLocalDate(range.end ?? undefined),
                name: name.trim(),
            },
            {
                onSuccess: () => {
                    reset();
                    onClose();
                },
                onError: (serverErrors) => setErrors(serverErrors),
                onFinish: () => setProcessing(false),
            },
        );
    };

    // Inertia reports date problems under the payload keys, not `range`.
    const rangeError = errors.range ?? errors.start_date ?? errors.end_date;

    const formatDateRange = () => {
        if (!range.start) return 'No dates selected';
        const start = format(range.start, 'MMM d, yyyy');
        if (!range.end) return `${start} — pick an end date`;
        return `${start} — ${format(range.end, 'MMM d, yyyy')}`;
    };

    return (
        <BaseModal
            show={isOpen}
            onClose={handleClose}
            closeable={!processing}
            panelClassName="w-full max-w-5xl my-8 bg-white dark:bg-gray-800 shadow-2xl rounded-3xl"
        >
            {/* Honours prefers-reduced-motion for every animation in the modal. */}
            <MotionConfig reducedMotion="user">
                <div className="p-8 sm:p-10">
                    <motion.div
                        className="mb-8 flex items-start justify-between gap-4"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            type: 'spring',
                            stiffness: 320,
                            damping: 28,
                        }}
                    >
                        <div>
                            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
                                Create New Period
                            </h2>
                            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                Name the period and pick the range it covers.
                            </p>
                        </div>
                        <motion.button
                            type="button"
                            onClick={handleClose}
                            aria-label="Close"
                            whileHover={{ scale: 1.12, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            transition={{
                                type: 'spring',
                                stiffness: 400,
                                damping: 20,
                            }}
                            className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                        >
                            <X className="h-6 w-6" />
                        </motion.button>
                    </motion.div>

                    <motion.form
                        onSubmit={handleCreate}
                        className="space-y-7"
                        noValidate
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={sectionVariants}>
                            <label
                                htmlFor="period-name"
                                className="mb-2.5 block text-base font-medium text-gray-700 dark:text-gray-200"
                            >
                                Period Name{' '}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="period-name"
                                type="text"
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setErrors(
                                        ({ name: _removed, ...rest }) => rest,
                                    );
                                }}
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={
                                    errors.name
                                        ? 'period-name-error'
                                        : undefined
                                }
                                className={`block w-full rounded-2xl px-5 py-4 text-lg shadow-sm transition-all dark:bg-gray-700 dark:text-gray-100 ${
                                    errors.name
                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-500'
                                        : 'border-gray-300 focus:border-gray-800 focus:ring-gray-800 dark:border-gray-600'
                                }`}
                                placeholder="e.g., Q4 Sprint"
                            />
                            <AnimatePresence initial={false}>
                                {errors.name && (
                                    <motion.p
                                        id="period-name-error"
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="overflow-hidden text-sm text-red-600 dark:text-red-400"
                                    >
                                        {errors.name}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div variants={sectionVariants}>
                            <div className="mb-2.5 flex items-center justify-between">
                                <span className="text-base font-medium text-gray-700 dark:text-gray-200">
                                    Select Period{' '}
                                    <span className="text-red-500">*</span>
                                </span>
                                <motion.button
                                    type="button"
                                    onClick={() => setRange(emptyRange)}
                                    disabled={!range.start}
                                    whileHover={
                                        range.start
                                            ? { scale: 1.05 }
                                            : undefined
                                    }
                                    whileTap={
                                        range.start
                                            ? { scale: 0.95 }
                                            : undefined
                                    }
                                    className="text-sm font-medium text-gray-500 underline-offset-2 transition-colors hover:text-gray-800 hover:underline disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-gray-100"
                                >
                                    Clear
                                </motion.button>
                            </div>

                            <div
                                aria-live="polite"
                                className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-600 dark:bg-gray-700"
                            >
                                <p className="flex flex-wrap items-baseline gap-x-2 text-base text-gray-600 dark:text-gray-300">
                                    <span className="font-medium text-gray-500 dark:text-gray-400">
                                        Selected:
                                    </span>
                                    <AnimatePresence
                                        mode="wait"
                                        initial={false}
                                    >
                                        <motion.span
                                            key={formatDateRange()}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            transition={{ duration: 0.18 }}
                                            className="font-semibold text-gray-900 dark:text-gray-100"
                                        >
                                            {formatDateRange()}
                                        </motion.span>
                                    </AnimatePresence>
                                </p>
                            </div>

                            <DateRangeCalendar
                                value={range}
                                onChange={(next) => {
                                    setRange(next);
                                    setErrors(
                                        ({
                                            range: _range,
                                            start_date: _start,
                                            end_date: _end,
                                            ...rest
                                        }) => rest,
                                    );
                                }}
                            />
                            <AnimatePresence initial={false}>
                                {rangeError && (
                                    <motion.p
                                        variants={errorVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        className="overflow-hidden text-sm text-red-600 dark:text-red-400"
                                    >
                                        {rangeError}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        <motion.div
                            variants={sectionVariants}
                            className="flex gap-4 border-t border-gray-200 pt-7 dark:border-gray-700"
                        >
                            <motion.button
                                type="submit"
                                disabled={processing}
                                whileHover={
                                    processing ? undefined : { scale: 1.02 }
                                }
                                whileTap={
                                    processing ? undefined : { scale: 0.98 }
                                }
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                className="flex-1 rounded-2xl bg-gray-800 px-6 py-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-gray-200"
                            >
                                {processing ? 'Creating…' : 'Create Period'}
                            </motion.button>
                            <motion.button
                                type="button"
                                onClick={handleClose}
                                disabled={processing}
                                whileHover={
                                    processing ? undefined : { scale: 1.02 }
                                }
                                whileTap={
                                    processing ? undefined : { scale: 0.98 }
                                }
                                transition={{
                                    type: 'spring',
                                    stiffness: 400,
                                    damping: 25,
                                }}
                                className="flex-1 rounded-2xl bg-gray-100 px-6 py-4 text-base font-semibold text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                            >
                                Cancel
                            </motion.button>
                        </motion.div>
                    </motion.form>
                </div>
            </MotionConfig>
        </BaseModal>
    );
}
